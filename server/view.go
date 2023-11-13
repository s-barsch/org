package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"org/server/helper"
	"org/server/helper/file"
	"org/server/helper/path"
	"os"
	fp "path/filepath"
	"time"
)

func isAll(path string) bool {
	return fp.Base(path) == "all"
}

func viewFile(w http.ResponseWriter, r *http.Request) *helper.Err {
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

func serveStatic(w http.ResponseWriter, r *http.Request) *helper.Err {
	path := r.URL.Path[len("/file"):]

	http.ServeFile(w, r, ROOT+path)

	return nil
}

func getToday(w http.ResponseWriter, r *http.Request) *helper.Err {
	e := &helper.Err{
		Func: "getToday",
		Code: 500,
	}

	path, err := makeToday()
	if err != nil {
		e.Err = err
		return e
	}

	fmt.Fprint(w, path)
	return nil
}

func makeToday() (string, error) {
	path := todayPath()
	_, err := os.Stat(path)
	if err != nil {
		err := os.MkdirAll(ROOT+path, 0755)
		if err != nil {
			return "", err
		}
	}
	return path, nil
}

func todayPath() string {
	t := time.Now()
	if t.Hour() < 6 {
		t = time.Now().AddDate(0, 0, -1)
	}
	return fmt.Sprintf("/private/graph/%v", t.Format("06/06-01/02"))
}

func getNow(w http.ResponseWriter, r *http.Request) *helper.Err {
	e := &helper.Err{
		Func: "getNow",
		Code: 500,
	}

	today, err := makeToday()
	if err != nil {
		e.Err = err
		return e
	}

	now, err := makeNow(today)
	if err != nil {
		e.Err = err
		return e
	}

	fmt.Fprint(w, now)
	return nil
}

func makeNow(today string) (string, error) {
	t := time.Now()
	path := fp.Join(today, t.Format("060102_150405.txt"))
	return path, os.WriteFile(ROOT+path, []byte(""), 0644)
}
