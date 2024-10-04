package helper

import (
	"fmt"
	"os"
	fp "path/filepath"
	"time"

	"g.sacerb.com/org/go/helper/file"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Err struct {
	Func string
	Path string
	Code int
	Err  error
}

func (e *Err) Error() string {
	// err is initialized with 0
	if e.Code == 0 {
		e.Code = 500
	}
	return fmt.Sprintf("%v: %v (%d) (%v)", e.Func, e.Err.Error(), e.Code, e.Path)
}

func (e *Err) Set(err error, code int) *Err {
	e.Code = code
	e.Err = err
	return e
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

func Title(str string) string {
	return cases.Title(language.German).String(str)
}
