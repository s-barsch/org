package main

import (
	"bytes"
	"io/ioutil"
	p "path/filepath"
	"os"
	"strings"
)

func parseSort(path string) ([]*File, error) {
	list, err := readSort(p.Join(path, ".sort"))
	if err != nil {
		return nil, err
	}

	return makeFiles(path, list), nil
}

func makeFiles(path string, list []string) []*File {
	files := []*File{}
	for _, name := range list {
		filepath := p.Join(path, name)
		fi, err := os.Stat(ROOT + filepath)
		if err != nil {
			continue
		}
		files = append(files, &File{
			Name: name,
			Path: filepath,
			Type: getFileType(filepath, fi.IsDir()),
		})
	}
	return files
}

func readSort(path string) ([]string, error) {
	b, err := ioutil.ReadFile(ROOT + path)
	if err != nil {
		return nil, err
	}

	list := []string{}
	dupli := make(map[string]bool)
	for _, name := range strings.Split(string(b), "\n") {
		if name == "" || dupli[name] == true || dupli[stripExt(name)] == true {
			continue
		}
		list = append(list, name)
		dupli[name] = true
		if p.Ext(name) == ".info" {
			dupli[stripExt(name)] = true
		}
	}
	return list, nil
}

func hasSort(path string) bool {
	return exists(p.Join(ROOT, path, ".sort"))
}

func exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func merge(sorted, files []*File) []*File {
	return append(sorted, subtract(files, sorted)...)
}


func subtract(base, other []*File) []*File {
	for _, x := range other {
		for j, f := range base {
			if x.Name == f.Name {
				base = append(base[:j], base[j+1:]...)
				break
			}
		}
	}
	return base
}

func writeSortFile(path string, files []*File) error {

	buf := bytes.Buffer{}

	for _, f := range files {
		buf.WriteString(f.Name)
		buf.WriteString("\n")
	}

	return ioutil.WriteFile(p.Join(ROOT, path, ".sort"), buf.Bytes(), 0755)
}

// makes sure file keeps its sorting position
func renameSortEntry(oldPath, newPath string) error {
	oldDir := p.Dir(oldPath)
	if !hasSort(oldDir) {
		return nil
	}

	// has no sorting position in new directory
	if newDir := p.Dir(newPath); oldDir != newDir {
		return nil
	}

	sorted, err := parseSort(oldDir)
	if err != nil {
		return err
	}

	f := NewFile(newPath)

	for i, v := range sorted {
		if v.Path == oldPath {
			sorted[i] = f
		}
	}
	
	return writeSortFile(oldDir, sorted)
}


type Asc []*File
func (a Asc) Len() int           { return len(a) }
func (a Asc) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a Asc) Less(i, j int) bool { return a[i].Name < a[j].Name }
