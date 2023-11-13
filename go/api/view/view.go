package view

import (
	"encoding/json"
	"fmt"
	"net/http"
	"org/go/helper"
	"org/go/helper/file"
	"org/go/helper/path"
	"org/go/index"
	fp "path/filepath"
)

func isAll(path string) bool {
	return fp.Base(path) == "all"
}

func ViewFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	path := &path.Path{Rel: r.URL.Path[len("/api/view"):]}

	all := false
	if isAll(path.Rel) {
		path.Rel = fp.Dir(path.Rel)
		all = true
	}

	e := &helper.Err{
		Func: "viewFile",
		Path: path.Rel,
		Code: 500,
	}

	if path.IsFile() {
		path.Rel = fp.Dir(path.Rel)
	}

	if !path.Exists() {
		e.Err = fmt.Errorf("Not found %v", path.Rel)
		e.Code = 404
		return e
	}

	v := &helper.DirView{}
	var err error
	if all {
		v, err = viewDirRecursive(path)
	} else {
		v, err = viewDir(path)
	}
	if err != nil {
		e.Err = err
		return e
	}

	err = json.NewEncoder(w).Encode(v)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func viewDirRecursive(path *path.Path) (*helper.DirView, error) {
	files, err := file.GetFilesRecursive(path)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*file.File{}
	}

	return &helper.DirView{
		Path: path.Rel,
		Dir: &helper.Dir{
			Files:  files,
			Sorted: false,
		},
	}, nil
}

func viewDir(path *path.Path) (*helper.DirView, error) {
	files, sorted, err := file.GetFiles(path)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*file.File{}
	}

	return &helper.DirView{
		Path: path.Rel,
		Dir: &helper.Dir{
			Files:  files,
			Sorted: sorted,
		},
	}, nil
}

func ServeStatic(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	path := r.URL.Path[len("/file"):]

	http.ServeFile(w, r, fp.Join(ix.Root, path))

	return nil
}
