package view

import (
	"encoding/json"
	"fmt"
	"net/http"
	fp "path/filepath"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/path"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func isAll(path string) bool {
	return fp.Base(path) == "all"
}

func ViewFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/view"):])

	all := false
	if isAll(p.Rel) {
		p.Rel = fp.Dir(p.Rel)
		all = true
	}

	e := &reqerr.Err{
		Func: "view.ViewFile",
		Path: p.Rel,
	}

	if p.IsFile() {
		p.Rel = fp.Dir(p.Rel)
	}

	if !p.Exists() {
		return e.Set(fmt.Errorf("not found"), 404)
	}

	var v *helper.DirView
	var err error
	if all {
		v, err = viewDirRecursive(p)
	} else {
		v, err = viewDir(p)
	}
	if err != nil {
		return e.Set(err, 500)
	}

	err = json.NewEncoder(w).Encode(v)
	if err != nil {
		return e.Set(err, 500)
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

func ServeStatic(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	path := r.URL.Path[len("/file"):]

	http.ServeFile(w, r, fp.Join(ix.Root, path))

	return nil
}
