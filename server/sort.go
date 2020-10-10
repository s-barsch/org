package main

import (
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
		if name == "" || dupli[name] == true {
			continue
		}
		list = append(list, name)
	}
	return list, nil
}

func hasSort(path string) bool {
	_, err := os.Stat(ROOT + path + "/.sort")
	return err == nil
}

func merge(files, sorted []*File) []*File {
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
/*
func writeSort(path string, fs files) error {
	path = filepath.Join(path, ".sort")
	var buf bytes.Buffer
	for _, f := range fs {
		buf.WriteString(f.name)
		buf.WriteString("\n")
	}
	return ioutil.WriteFile(path, buf.Bytes(), 0755)
}
*/

/*
func renameSortEntry(oldpath, newpath string) error {
	dir := filepath.Dir(oldpath)
	if !exists(filepath.Join(dir, ".sort")) {
		return nil
	}
	if dir != filepath.Dir(newpath) {
		// the respective sort files in each dir
		// will do the right job
		return nil
	}
	sorted, err := parseSort(dir)
	if err != nil {
	    println("here")
		return err
	}
	fi, err := os.Stat(oldpath)
	if err != nil {
		return err
	}
	f := &file{
		name: filepath.Base(newpath),
		path: newpath,
		isdir: fi.IsDir(),
	}
	for i, v := range sorted {
		if v.path == oldpath {
			sorted[i] = f
		}
	}
	return writeSort(dir, sorted)
}
*/


type Asc []*File
func (a Asc) Len() int           { return len(a) }
func (a Asc) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a Asc) Less(i, j int) bool { return a[i].Name < a[j].Name }
