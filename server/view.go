package main

import (
	"net/http"
	"os"
	"fmt"
	"strings"
	p "path/filepath"
	"encoding/json"
	"io/ioutil"
	"time"
)

type View struct {
	File      *File   `json:"file"`
	Parent    string  `json:"parent"`
	Switch    string  `json:"switch"`
	Neighbors []*File `json:"neighbors"`
}

func viewFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "viewFile",
		Path: path,
		Code: 500,
	}

	fi, err := os.Stat(ROOT + path)
	if err != nil {
		e.Err = fmt.Errorf("Not found %v", path)
		e.Code = 404
		return e
	}

	neighbors, err := getNeighbors(path)
	if err != nil {
		e.Err = err
		return e
	}

	v := &View{
		File: &File{
			Path: path,
			Type: getFileType(path, fi.IsDir()),
		},
		Switch:    getSwitchPath(path),
		Parent:    p.Dir(path),
		Neighbors: neighbors,
	}

	err = json.NewEncoder(w).Encode(v)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func getSwitchPath(path string) string {
	public := false
	if l := len("/public"); len(path) > l {
		public = path[:l] == "/public"
	}
	
	var find, replace string

	if public {
		find = "public"
		replace = "private"
	} else {
		find = "private"
		replace = "public"
	}
	
	newPath := strings.Replace(path, find, replace, -1)

	existent := findExistent(newPath)
	
	if existent == "/private" || existent == "/public" {
		return ""
	}
	return existent
}

func findExistent(path string) string {
	if path == "/" || path == "." {
		return path
	}
	_, err := os.Stat(ROOT + path)
	if err == nil {
		return path
	}
	return findExistent(p.Dir(path))
}

func getNeighbors(path string) ([]*File, error) {
	files, err := getFiles(p.Dir(path))
	if err != nil {
		return nil, err
	}

	c := 0
	for i, f := range files {
		if f.Path == path {
			c = i
			break
		}
	}

	length := len(files)

	start := 0
	end := length

	d := 2

	if c + 1 + d < length {
		end = c + 1 + d
	}
	if c - d > 0 {
		start = c - d
	}

	return files[start:end], nil
}

func serveStatic(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/file"):]

	e := &Err{
		Func: "serveStatic",
		Path: path,
		Code: 500,
	}

	if fileType(path) == "text" {
		b, err := ioutil.ReadFile(ROOT + path)
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

	http.ServeFile(w, r, ROOT+path)

	return nil
}

func viewLinks(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "viewLinks",
		Code: 500,
	}

	err := json.NewEncoder(w).Encode(siteConfig.Links)
	if err != nil {
		e.Err = err
		return e
	}
	return nil
}

func viewToday(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "viewToday",
		Code: 500,
	}

	path, err := getCurrent()
	if err != nil {
		e.Err = err
		return e
	}

	fmt.Fprint(w, path)
	return nil
}

func getCurrent() (string, error) {
	path := currentDatePath()
	_, err := os.Stat(path) 
	if err != nil {
		err := os.MkdirAll(ROOT + path, 0755)
		if err != nil {
			return "", err
		}
	}
	return path, nil
}


func currentDatePath() string {
	t := time.Now()
	if t.Hour() < 6 {
		t = time.Now().AddDate(0, 0, -1)
	}
	return fmt.Sprintf("/private/graph/%v", t.Format("06/06-01/02"))
}
