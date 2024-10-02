package view

import (
	"encoding/json"
	"fmt"
	"net/http"
	fp "path/filepath"

	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/helper/file"
	"g.sacerb.com/org/go/helper/path"
	"g.sacerb.com/org/go/index"
)

func isAll(path string) bool {
	return fp.Base(path) == "all"
}

func ViewFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/view"):])

	all := false
	if isAll(p.Rel) {
		p.Rel = fp.Dir(p.Rel)
		all = true
	}

	e := &helper.Err{
		Func: "viewFile",
		Path: p.Rel,
		Code: 500,
	}

	if p.IsFile() {
		p.Rel = fp.Dir(p.Rel)
	}

	if !p.Exists() {
		e.Err = fmt.Errorf("not found %v", p.Rel)
		e.Code = 404
		return e
	}

	var v *helper.DirView
	var err error
	if all {
		v, err = viewDirRecursive(p)
	} else {
		v, err = viewDir(p)
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

func viewDir(p *path.Path) (*helper.DirView, error) {
	files, sorted, err := file.GetFiles(p)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*file.File{}
	}

	return &helper.DirView{
		Path: p.Rel,
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
