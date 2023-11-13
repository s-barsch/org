package helper

import (
	"fmt"
	"org/server/helper/file"
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
