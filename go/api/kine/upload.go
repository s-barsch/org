package kine

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/helper/path"
	"g.sacerb.com/org/go/index"
	"gopkg.in/vansante/go-ffprobe.v2"

	"g.sacerb.com/imagecache/cache"
)

func Upload(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len(UploadAPI):])
	h := &helper.Err{
		Func: "kine.Upload",
		Path: p.Rel,
		Code: 500,
	}

	status := fmt.Sprintf("received %v", filepath.Base(p.Abs()))
	log.Println(status)
	ix.Status <- status
	err := saveFile(p, r)
	if err != nil {
		h.Err = err
		return h
	}
	status = fmt.Sprintf("%v was saved", filepath.Base(p.Abs()))
	log.Println(status)
	ix.Status <- status

	if ix.Processing != nil {
		h.Err = fmt.Errorf("cannot process because ix.Processing != nil")
		return h
	}

	switch {
	case p.Base() == "cover.jpg":
		h.Err = cache.CacheImage(cache.File(p.Abs()), &cache.Options{})
		return h
	case p.Ext() == ".mp4":
		return cacheVideo(ix, p.Abs())
	}
	fmt.Fprint(w, "")
	return nil
}

func saveFile(path *path.Path, r *http.Request) error {
	b, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	return os.WriteFile(path.Abs(), b, 0755)
}

type VideoData struct {
	Width    int
	Height   int
	Duration float64
}

// get resolution + duration
// cache different sizes

func getVideoData(path string) (*VideoData, error) {
	ctx, cancelFn := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelFn()
	data, err := ffprobe.ProbeURL(ctx, path)
	if err != nil {
		return nil, err
	}
	v := data.Streams[0]
	return &VideoData{
		Width:    v.Width,
		Height:   v.Height,
		Duration: durationToI(v.Duration),
	}, nil
}

func durationToI(d string) float64 {
	s, err := strconv.ParseFloat(d, 32)
	if err != nil {
		panic(err)
	}
	return s
}

func cacheVideo(ix *index.Index, path string) *helper.Err {
	h := &helper.Err{
		Func: "kine.cacheVideo",
		Path: path,
		Code: 500,
	}
	v, err := getVideoData(path)
	if err != nil {
		h.Err = err
		return h
	}
	sizes := []string{"1080", "720", "480"}
	ix.Processing = &index.Processing{
		Name:     filepath.Base(path),
		Duration: v.Duration,
		Steps:    len(sizes),
	}
	defer resetProcessing(ix)
	for i, size := range sizes {
		ix.Abort = make(chan bool)
		ix.Processing.Size = size
		ix.Processing.Step = i + 1
		err := cacheVideoSize(path, v, size, ix.Abort)
		if err != nil {
			return err
		}
	}
	return nil
}

func resetProcessing(ix *index.Index) {
	ix.Processing = nil
}

func cacheVideoSize(path string, v *VideoData, size string, abort chan bool) *helper.Err {
	h := &helper.Err{
		Func: "kine.cacheVideo",
		Path: path,
		Code: 500,
		Err:  nil,
	}
	var scale string
	// make sure that scale values are divisible by 2 for libx264
	if v.Width > v.Height {
		// portrait
		scale = fmt.Sprintf("scale=trunc(oh*a/2)*2:%v", size)
	} else {
		// landsacpe
		scale = fmt.Sprintf(`scale="%v:trunc(ow/a/2)*2"`, size)
	}
	cmd := exec.Command(
		"ffmpeg",
		"-i", path,
		"-vf", scale,
		"-c:v", "libx264",
		"-c:a", "copy",
		// quality
		"-crf", "23",
		"-stats_period", "0.5",
		// application specific. see listen.go.
		"-progress", "http://localhost:9002",
		// override existing files
		"-y",
		outputPath(path, size),
	)
	defer close(abort)
	stderr, err := cmd.StderrPipe()
	if err != nil {
		h.Err = err
		return h
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		h.Err = err
		return h
	}
	go func() {
		merged := io.MultiReader(stderr, stdout)
		scanner := bufio.NewScanner(merged)
		for scanner.Scan() {
			// not very useful. just indicates start of process, no updates.
			fmt.Println(scanner.Text())
		}
	}()
	go func() {
		for range abort {
			err := cmd.Process.Kill()
			if err != nil {
				panic(err)
			}
		}
	}()
	if err := cmd.Start(); err != nil {
		h.Err = err
		return h
	}
	if err := cmd.Wait(); err != nil {
		h.Code = 200
		h.Err = err
		return h
	}
	return nil
}

func outputPath(path, size string) string {
	l := len(path)
	return path[:l-4] + "-" + size + ".mp4"
}
