package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	fp "path/filepath"
	"strings"
	"time"
)

type DirView struct {
	Path string `json:"path"`
	Dir  *Dir   `json:"dir"`
}

type Dir struct {
	Files  []*File `json:"files"`
	Sorted bool    `json:"sorted"`
}

type Path struct {
	Rel string
}

func (p *Path) IsFile() bool {
	return strings.Contains(p.Rel, ".")
}

func (p *Path) Parent() *Path {
	return &Path{Rel: fp.Dir(p.Rel)}
}

func (p *Path) Base() string {
	return fp.Base(p.Rel)
}

func (p *Path) Abs() string {
	return ROOT + p.Rel
}

func (p *Path) Exists() bool {
	return exists(p.Abs())
}

func exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func isAll(path string) bool {
	return fp.Base(path) == "all"
}

func viewFile(w http.ResponseWriter, r *http.Request) *Err {
	path := &Path{Rel: r.URL.Path[len("/api/view"):]}

	all := false
	if isAll(path.Rel) {
		path.Rel = fp.Dir(path.Rel)
		all = true
	}

	e := &Err{
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

	v := &DirView{}
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

func viewDirRecursive(path *Path) (*DirView, error) {
	files, err := getFilesRecursive(path)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*File{}
	}

	return &DirView{
		Path: path.Rel,
		Dir: &Dir{
			Files:  files,
			Sorted: false,
		},
	}, nil
}

func viewDir(path *Path) (*DirView, error) {
	files, sorted, err := getFiles(path)
	if err != nil {
		return nil, err
	}

	if files == nil {
		files = []*File{}
	}

	return &DirView{
		Path: path.Rel,
		Dir: &Dir{
			Files:  files,
			Sorted: sorted,
		},
	}, nil
}

func serveStatic(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/file"):]

	/*
		e := &Err{
			Func: "serveStatic",
			Path: path,
			Code: 500,
		}

		if fileType(path) == "text" {
			b, err := os.ReadFile(ROOT + path)
			if err != nil {
				if p.Ext(path) == ".info" {
					// dummy requests arrive, because of attached info field
					return nil
				}
				e.Err = err
				return e
			}

			fmt.Fprintf(w, "%s", removeNewLine(b))
			return nil
		}
	*/

	http.ServeFile(w, r, ROOT+path)

	return nil
}

func getToday(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
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

func getNow(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
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
