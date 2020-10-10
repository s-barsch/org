package main

import (
	"io/ioutil"
	"os"
	p "path/filepath"
	"strings"
	"sort"
	//"fmt"
)

type File struct {
	Path string `json:"path"`
	Name string `json:"name"`
	Type string `json:"type"`
}

func getFiles(path string) ([]*File, error) {
	files, err := readFiles(path)
	if err != nil {
		return nil, err
	}

	if hasSort(path) {
		sorted, err := parseSort(path)
		if err != nil {
			return nil, err
		}

		/*
		for _, f := range sorted {
			fmt.Println(f.Name)
			fmt.Printf("\t%v\n", f.Type)
		}
		fmt.Println("-")
		*/

		return merge(files, sorted), nil
	}

	return preSort(files), nil
}



func readFiles(path string) ([]*File, error) {
	l, err := ioutil.ReadDir(p.Join(ROOT, path))
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for _, fi := range l {
		fpath := p.Join(path, fi.Name())
		files = append(files, &File{
			Name: fi.Name(),
			Path: fpath,
			Type: getFileType(fpath, fi.IsDir()),
		})
	}
	return files, nil
}

func preSort(files []*File) []*File {
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

	sort.Sort(sort.Reverse(Asc(nu)))

	return separate(nu)
}

func separate(all []*File) []*File {
	var dirs, files []*File
	for _, f := range all {
		if f.Type == "dir" {
			dirs = append(dirs, f)
			continue
		}
		files = append(files, f)
	}
	return append(dirs, files...)
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
