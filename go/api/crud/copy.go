package crud

import (
	"fmt"
	"net/http"
	"org/go/helper"
	"org/go/helper/path"
	"org/go/index"
	"os"
	"strings"
)

func CopyFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/copy"):])

	e := &helper.Err{
		Func: "copyFile",
		Path: p.Rel,
		Code: 500,
	}

	newPath, err := getBodyPath(r)
	if err != nil {
		e.Err = err
		return e
	}

	newP := p.New(newPath)

	if strings.Contains(newP.Rel, "/public/") {
		dir := newP.Parent()
		err := os.MkdirAll(dir.Abs(), 0755)
		if err != nil {
			e.Err = err
			return e
		}
		err = createInfo(dir)
		if err != nil {
			return e
		}
	}

	err = copyFileFunc(p, newP)
	if err != nil {
		e.Err = fmt.Errorf("Faulty target path: %v", newPath)
		return e
	}

	return nil
}

func copyFileFunc(oldpath, newpath *path.Path) error {
	b, err := os.ReadFile(oldpath.Abs())
	if err != nil {
		return err
	}

	return os.WriteFile(newpath.Abs(), b, 0644)
}
