package helper

import (
	"fmt"
	"org/go/helper/file"
	"os"
	fp "path/filepath"
	"time"
)

type Err struct {
	Func string
	Path string
	Code int
	Err  error
}

func (e *Err) Error() string {
	return fmt.Sprintf("%v: %v (%d)\npath: %v", e.Func, e.Err.Error(), e.Code, e.Path)
}

type DirView struct {
	Path string `json:"path"`
	Dir  *Dir   `json:"dir"`
}

type Dir struct {
	Files  []*file.File `json:"files"`
	Sorted bool         `json:"sorted"`
}

func MakeToday(root string) (string, error) {
	path := TodayPath()
	_, err := os.Stat(path)
	if err != nil {
		err := os.MkdirAll(fp.Join(root, path), 0755)
		if err != nil {
			return "", err
		}
	}
	return path, nil
}

func TodayPath() string {
	t := time.Now()
	if t.Hour() < 6 {
		t = time.Now().AddDate(0, 0, -1)
	}
	return fmt.Sprintf("/private/graph/%v", t.Format("06/06-01/02"))
}
