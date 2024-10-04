package crud

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/path"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func WriteFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])
	e := reqerr.New("WriteFile", p.Path)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return e.Set(err, 500)
	}

	// delete empty info files
	if p.Ext() == ".info" && len(body) == 0 {
		err := rmFile(p.Abs())
		if err != nil {
			return e.Set(err, 500)
		}
		return nil
	}

	// handle newfile command
	if bytes.Equal(body, []byte("newfile")) {
		body = []byte{}
	}

	body = file.RemoveMultipleNewLines(body)
	body = file.AddNewLine(body)

	err = isTodayPath(p)
	if err != nil {
		return e.Set(err, 500)
	}

	err = os.WriteFile(p.Abs(), body, 0664)
	if err != nil {
		return e.Set(err, 500)
	}
	ix.UpdateFile(p.Path)

	// log.Printf("writeFile:\n{%s}\n", body)
	return nil
}

func CreateDir(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])
	e := reqerr.New("createDir", p.Path)

	dir := p.Parent()
	fi, err := os.Stat(dir.Abs())
	if err != nil {
		return e.Set(err, 500)
	}
	if !fi.IsDir() {
		e.Err = fmt.Errorf("cannot create dir in non-dir")
		return e
	}
	err = os.Mkdir(p.Abs(), 0755)
	if err != nil {
		return e.Set(err, 500)
	}

	err = createInfo(p)
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}

func createInfo(p *path.Path) error {
	if p.Base() == "bot" || !strings.Contains(p.Path, "/public") {
		return nil
	}

	return os.WriteFile(p.Abs()+"/info", []byte(getInfoText(p.Path)), 0755)
}

func getInfoText(path string) string {
	var (
		date        time.Time
		title, text string
	)

	t, err := parsePathDate(path)
	if err != nil {
		date = time.Now()
		title = helper.Title(filepath.Base(path))
	} else {
		date = t
	}

	if title != "" {
		text = fmt.Sprintf("title: %v\n", title)
	}

	return fmt.Sprintf("%vdate: %v\n", text, date.Format("060102_150405"))
}

/*
func getDirDate(path string) time.Time {
	t, err := parsePathDate(path)
	if err != nil {
		return time.Now()
	}
	return t
}
*/

func parsePathDate(path string) (time.Time, error) {
	format := "/06/06-01/02"
	lenPath := len(path)
	lenFormat := len(format)
	if lenPath > lenFormat {
		t, err := time.Parse(format, path[lenPath-lenFormat:])
		if err != nil {
			return time.Time{}, err
		}
		// this is because years start on second 0, months on 1, days on 2)
		return t.Add(time.Second * 2), nil
	}
	return time.Time{}, fmt.Errorf("getDirDate: path too short")
}

func isTodayPath(p *path.Path) error {
	today := helper.TodayPath()
	dir := p.Parent()
	if dir.Path == today {
		if !dir.Exists() {
			_, err := helper.MakeToday(p.Root)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func WriteSwitch(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])

	if strings.Contains(p.Path, ".") || p.Base() == "info" {
		return WriteFile(ix, w, r)
	}
	return CreateDir(ix, w, r)
}

func rmFile(path string) error {
	_, err := os.Stat(path)
	if err != nil {
		return nil
	}
	return os.Remove(path)
}
