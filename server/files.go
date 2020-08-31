package main

import (
	"io/ioutil"
	"path/filepath"
	"strings"
	"os"
)

type File struct {
	Path  string `json:"path"`
	Type  string `json:"type"`
}

func getFiles(path string) ([]*File, error) {
	l, err := ioutil.ReadDir(filepath.Join(ROOT, path))
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for _, fi := range l {
		isDir := fi.IsDir()
		if fi.Mode() & os.ModeSymlink != 0 {
			isDir = true
		}
		files = append(files, &File{
			Path:  filepath.Join(path, fi.Name()),
			Type:  typ(path, isDir),
		})
	}
	return files, nil
}

func typ(path string, isDir bool) string {
	if isDir {
		return "dir"
	}
	switch filepath.Ext(strings.ToLower(path)) {
	case ".jpg", ".png", ".gif":
		return "image"
	}
	return "file"
}
