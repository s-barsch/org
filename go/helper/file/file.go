package file

import (
	"fmt"
	"os"
	fp "path/filepath"
	"strings"

	"g.rg-s.com/org/go/helper/path"
)

type File struct {
	Num  int    `json:"id"`
	Path string `json:"path"`
	Name string `json:"name"`
	Type string `json:"type"`
	Body string `json:"body"`
	root string
}

func (f *File) abs() string {
	if f.root == "" {
		panic(fmt.Sprintf("*file.File.root shall never be empty. (%v)", f.Path))
	}
	return fp.Join(f.root + f.Path)
}

func (f *File) Read() error {
	b, err := os.ReadFile(f.abs())
	if err != nil {
		return err
	}
	f.Body = string(RemoveNewLine(b))
	return nil
}

func GetFilesRecursive(p *path.Path) ([]*File, error) {
	l, _, err := GetFiles(p)
	if err != nil {
		return nil, err
	}
	files := []*File{}
	for _, f := range l {
		if f.Type == "dir" {
			dirFiles, err := GetFilesRecursive(p.New(f.Path))
			if err != nil {
				return nil, err
			}
			files = append(files, dirFiles...)
		}
		if isInfoSort(f.Path) {
			continue
		}
		files = append(files, f)
	}
	return files, nil
}

/*
func printFiles(files []*File) {
	for _, f := range files {
		fmt.Println(f.Name)
	}
}
*/

func stripExt(path string) string {
	return path[:len(path)-len(fp.Ext(path))]
}

func GetFileType(path string, isDir bool) string {
	if isDir {
		return "dir"
	}
	return fileType(path)
}

func isDir(de os.DirEntry) bool {
	return de.IsDir() || isDirMode(de.Type())
}

func isDirMode(mode os.FileMode) bool {
	return mode&os.ModeSymlink != 0
}

/*
func fileTypeStat(path string) string {
	t := fileType(path)
	if t != "file" {
		return t
	}
	fi, err := os.Stat(path)
	if err != nil {
		return "file"
	}
	if fi.IsDir() || isDirMode(fi.Mode()) {
		return "dir"
	}
	return t
}
*/

func fileType(path string) string {
	switch fp.Ext(strings.ToLower(path)) {
	case ".jpg", ".png", ".gif":
		return "image"
	case ".mp4":
		return "video"
	case ".mp3", ".wav":
		return "audio"
	case ".txt", ".info":
		return "text"
	}
	if isInfoSort(path) {
		return "text"
	}
	return "file"
}

func isInfoSort(path string) bool {
	switch fp.Base(path) {
	case "info", ".sort":
		return true
	}
	return false
}
