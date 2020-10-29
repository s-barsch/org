package main

import (
	"fmt"
	"io/ioutil"
	"os"
	p "path/filepath"
	"sort"
	"strings"
)

type File struct {
	Num  int    `json:"id"`
	Path string `json:"path"`
	Name string `json:"name"`
	Type string `json:"type"`
	Body string `json:"body"`
}

func NewFile(path string) *File {
	return &File{
		Name: p.Base(path),
		Path: path,
		Type: fileType(ROOT + path),
	}
}

func (f *File) Read() error {
	b, err := ioutil.ReadFile(ROOT + f.Path)
	if err != nil {
		return err
	}
	f.Body = string(removeNewLine(b))
	return nil
}

func getFiles(path string) ([]*File, bool, error) {
	files, err := readFiles(path)
	if err != nil {
		return nil, false, err
	}

	for _, f := range files {
		if f.Type == "text" {
			err = f.Read()
			if err != nil {
				return nil, false, err
			}
		}
	}
	if !hasSort(path) {
		return antoSort(files), false, err
	}

	sorted, err := parseSort(path)
	if err != nil {
		return nil, false, err
	}

	fresh := merge(sorted, files)

	return renumerate(fresh), true, nil
	/*
		err = writeSortFile(path, freshSort)
		if err != nil {
			return nil, err
		}
	*/

	/*

	 */
}

func renumerate(files []*File) []*File {
	for i, f := range files {
		f.Num = i
	}
	return files
}

func readFiles(path string) ([]*File, error) {
	l, err := ioutil.ReadDir(p.Join(ROOT, path))
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for i, fi := range l {
		fpath := p.Join(path, fi.Name())
		files = append(files, &File{
			Num:  i,
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

	return antoSort(nu)
}

func printFiles(files []*File) {
	for _, f := range files {
		fmt.Println(f.Name)
	}
}

func divide(all []*File) (dirs, files []*File) {
	info := []*File{}
	sort := []*File{}
	for _, f := range all {
		if f.Type == "dir" {
			dirs = append(dirs, f)
			continue
		}
		if f.Name == "info" {
			info = append(info, f)
			continue
		}
		if f.Name == ".sort" {
			sort = append(sort, f)
			continue
		}
		files = append(files, f)
	}
	return dirs, append(info, append(files, sort...)...)
}

func antoSort(all []*File) []*File {
	dirs, files := divide(all)

	sort.Sort(Asc(dirs))
	sort.Sort(sort.Reverse(Asc(files)))

	return append(dirs, files...)
}

func separate(all []*File) []*File {
	dirs, files := divide(all)
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
	case ".mp4":
		return "video"
	case ".mp3", ".wav":
		return "audio"
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
