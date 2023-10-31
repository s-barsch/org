package main

import (
	"bytes"
	"os"
	p "path/filepath"
	"strings"
)

func parseSort(path string) ([]*File, error) {
	list, err := readSort(p.Join(path, ".sort"))
	if err != nil {
		return nil, err
	}

	return makeFiles(path, list)
}

func makeFiles(path string, list []string) ([]*File, error) {
	files := []*File{}
	for i, name := range list {
		filepath := p.Join(path, name)
		fi, err := os.Stat(ROOT + filepath)
		if err != nil {
			continue
		}
		f := &File{
			Num:  i,
			Name: name,
			Path: filepath,
			Type: getFileType(filepath, fi.IsDir()),
		}
		if f.Type == "text" {
			err = f.Read()
			if err != nil {
				return nil, err
			}
		}
		files = append(files, f)
	}
	return files, nil
}

func readSort(path string) ([]string, error) {
	b, err := os.ReadFile(ROOT + path)
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

func writeSortFile(path string, list []string) error {

	buf := bytes.Buffer{}

	for _, name := range list {
		buf.WriteString(name)
		buf.WriteString("\n")
	}

	return os.WriteFile(p.Join(ROOT, path, ".sort"), buf.Bytes(), 0755)
}

/*
func writeSortFile(path string, files []*File) error {

	buf := bytes.Buffer{}

	for _, f := range files {
		buf.WriteString(f.Name)
		buf.WriteString("\n")
	}

	return os.WriteFile(p.Join(ROOT, path, ".sort"), buf.Bytes(), 0755)
}
*/

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

	list, err := readSort(p.Join(oldDir, ".sort"))
	if err != nil {
		return err
	}

	oldName := p.Base(oldPath)

	for i, name := range list {
		if name == oldName {
			list[i] = p.Base(newPath)
		}
	}

	return writeSortFile(oldDir, list)
}

type Asc []*File

func (a Asc) Len() int           { return len(a) }
func (a Asc) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a Asc) Less(i, j int) bool { return a[i].Name < a[j].Name }
