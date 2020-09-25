package main

import (
	"io/ioutil"
	p "path/filepath"
	"strings"
	"os"
)

type File struct {
	Path  string `json:"path"`
	Type  string `json:"type"`
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
	return files, nil
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
	default:
		fi, err := os.Stat(path)
		if err != nil {
			return "file"
		}
		if fi.IsDir() || fi.Mode() & os.ModeSymlink != 0 {
			return "dir"
		}
	}
	return "file"
}
