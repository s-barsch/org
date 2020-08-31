package main

import (
	"io/ioutil"
)

type File struct {
	Path  string `json:"path"`
	IsDir bool	 `json:"isdir"`
}

func getFiles(path string) ([]*File, error) {
	l, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for _, fi := range l {
		files = append(files, &File{
			Path:  path + "/" + fi.Name(),
			IsDir: fi.IsDir(),
		})
	}
	return files, nil
}
