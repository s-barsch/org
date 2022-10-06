package main

import (
	"encoding/json"
	"net/http"
	"os"
	p "path/filepath"
	"strings"
)

type Nav struct {
	// Path is necessary here to give this object some sort of a life cycle.
	// React’s renderings are much faster than the server-side response.
	// Therefore, it has to know with what object it is dealing with.
	// Path     string  `json:"path"`
	Switcher string  `json:"switcher"`
	Siblings []*File `json:"siblings"`
}

func viewNav(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/nav"):]

	e := &Err{
		Func: "viewNav",
		Path: path,
		Code: 500,
	}

	nav, err := getNav(path)
	if err != nil {
		e.Err = err
		return e
	}

	err = json.NewEncoder(w).Encode(nav)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func getNav(path string) (*Nav, error) {
	siblings := []*File{}

	if strings.Count(path, "/") >= 4 {
		s, err := getSiblings(path)
		if err != nil {
			return nil, err
		}
		siblings = s
	}

	return &Nav{
		Siblings: siblings,
		Switcher: switchPath(path),
	}, nil
}

func getSiblings(path string) ([]*File, error) {
	files, _, err := getFiles(p.Dir(path))
	if err != nil {
		return nil, err
	}

	files = dirsOnly(files)

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

	if c+1+d < length {
		end = c + 1 + d
	}
	if c-d > 0 {
		start = c - d
	}

	return files[start:end], nil
}

// Switch path is the closest corresponding public or private path to a directory.
//
//	/public/graph/20/20-10/10/subdir
//
// -> /private/graph/20/20-10
func switchPath(path string) string {
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

// Recursive function going upwards the tree until it finds a existent
// directory.
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

func dirsOnly(files []*File) []*File {
	nu := []*File{}
	for _, f := range files {
		if f.Type == "dir" {
			nu = append(nu, f)
		}
	}
	return nu
}
