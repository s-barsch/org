package kine

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/helper/path"
	"g.sacerb.com/org/go/index"

	"g.sacerb.com/imagecache/cache"
)

func Upload(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	fmt.Println(r.URL.Path)
	p := ix.NewPath(r.URL.Path[len(UploadAPI):])

	err := handleUpload(p, r)
	if err != nil {
		log.Println(err)
	}
	fmt.Fprint(w, "")
	return nil
}

func handleUpload(path *path.Path, r *http.Request) error {
	b, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	err = os.WriteFile(path.Abs(), b, 0755)
	if err != nil {
		return err
	}

	err = cache.CacheImage(cache.File(path.Abs()), &cache.Options{})
	return err
}

func handleFormUpload(r *http.Request) error {
	err := r.ParseMultipartForm(16106127360)
	if err != nil {
		return err
	}
	for _, files := range r.MultipartForm.File {
		for _, file := range files {
			dst, err := os.Create(filepath.Join("./", file.Filename))
			log.Println("writing file: " + file.Filename)
			if err != nil {
				return err
			}
			f, err := file.Open()
			if err != nil {
				return err
			}
			_, err = io.Copy(dst, f)
			if err != nil {
				return err
			}
		}
	}
	return nil
}
