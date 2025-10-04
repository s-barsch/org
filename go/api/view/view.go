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
	if isAll(p.Path) {
		p.Path = fp.Dir(p.Path)
		all = true
	}

	e := reqerr.New("view.ViewFile", p.Path)

	if p.IsFile() {
		p.Path = fp.Dir(p.Path)
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

func viewDirRecursive(p *path.Path) (*helper.DirView, error) {
	files, err := file.GetFilesRecursive(p)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*file.File{}
	}

	return &helper.DirView{
		Path:  p.Path,
		Files: files,
	}, nil
}

func viewDir(p *path.Path) (*helper.DirView, error) {
	files, err := file.GetFiles(p)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*file.File{}
	}

	return &helper.DirView{
		Path:  p.Path,
		Files: files,
	}, nil
}

func ServeStatic(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	path := r.URL.Path[len("/file"):]

	http.ServeFile(w, r, fp.Join(ix.Root, path))

	return nil
}
