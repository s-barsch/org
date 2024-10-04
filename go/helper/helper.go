package helper

import (
	"fmt"
	"os"
	fp "path/filepath"
	"time"

	"g.rg-s.com/org/go/helper/file"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

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
