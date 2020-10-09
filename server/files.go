package main

import (
	"io/ioutil"
	"os"
	p "path/filepath"
	"strings"
)

type File struct {
	Path string `json:"path"`
	Type string `json:"type"`
}

func getFiles(path string) ([]*File, error) {
	l, err := ioutil.ReadDir(p.Join(ROOT, path))
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for _, fi := range l {
		fpath := p.Join(path, fi.Name())
		files = append(files, &File{
			Path: fpath,
			Type: getFileType(fpath, fi.IsDir()),
		})
	}
	return filterFiles(files), nil
}

func filterFiles(files []*File) []*File {
	nu := []*File{}
	for _, f := range files {
		if p.Ext(f.Path) == ".info" && hasFile(files, stripExt(f.Path)) {
			continue
		}
		if p.Base(f.Path) == "info" {
			nu = append([]*File{f}, nu...)
			continue
		}
		nu = append(nu, f)
	}
	return nu
}

func hasFile(files []*File, path string) bool {
	for _, f := range files {
		if f.Path == path {
			return true
		}
	}
	return false
}

func stripExt(path string) string {
	return path[:len(path)-len(p.Ext(path))]
}

func getFileType(path string, isDir bool) string {
	if isDir {
		return "dir"
	}
	return fileType(path)
}

func fileType(path string) string {
	switch p.Ext(strings.ToLower(path)) {
	case ".jpg", ".png", ".gif":
		return "image"
	case ".txt", ".info":
		return "text"
	}
	switch p.Base(path) {
	case "info", ".sort":
		return "text"
	}
	fi, err := os.Stat(ROOT + path)
	if err != nil {
		return "file"
	}
	if fi.IsDir() || fi.Mode()&os.ModeSymlink != 0 {
		return "dir"
	}
	return "file"
}
