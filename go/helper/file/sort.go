package file

import (
	"bytes"
	"os"
	fp "path/filepath"
	"strings"

	"g.rg-s.com/org/go/helper/path"
)

func parseSort(path *path.Path) ([]*File, error) {
	list, err := readSort(sortFilePath(path.Abs()))
	if err != nil {
		return nil, err
	}

	return makeSortFiles(path, list)
}

func makeSortFiles(dir *path.Path, list []string) ([]*File, error) {
	files := []*File{}
	for i, name := range list {
		p := dir.New(fp.Join(dir.Rel, name))
		fi, err := os.Stat(p.Abs())
		if err != nil {
			continue
		}
		f := &File{
			Num:  i,
			Name: name,
			Path: p.Rel,
			Type: GetFileType(p.Rel, fi.IsDir()),
			root: p.Root,
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

func readSort(sortFile string) ([]string, error) {
	b, err := os.ReadFile(sortFile)
	if err != nil {
		return nil, err
	}

	list := []string{}
	dupli := make(map[string]bool)
	for _, name := range strings.Split(string(b), "\n") {
		if name == "" || dupli[name] || dupli[stripExt(name)] {
			continue
		}
		list = append(list, name)
		dupli[name] = true
		if fp.Ext(name) == ".info" {
			dupli[stripExt(name)] = true
		}
	}
	return list, nil
}

func sortFilePath(path string) string {
	return fp.Join(path, ".sort")
}

func hasSort(p string) bool {
	return path.Exists(sortFilePath(p))
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

func WriteSortFile(path *path.Path, list []string) error {

	buf := bytes.Buffer{}

	for _, name := range list {
		buf.WriteString(name)
		buf.WriteString("\n")
	}

	return os.WriteFile(fp.Join(path.Abs(), ".sort"), buf.Bytes(), 0755)
}

// makes sure file keeps its sorting position
func RenameSortEntry(oldPath, newPath *path.Path) error {
	oldDir := oldPath.Parent()
	if !hasSort(oldDir.Abs()) {
		return nil
	}

	// has no sorting position in new directory
	if newDir := newPath.Parent(); oldDir != newDir {
		return nil
	}

	list, err := readSort(fp.Join(oldDir.Abs(), ".sort"))
	if err != nil {
		return err
	}

	oldName := oldPath.Base()

	for i, name := range list {
		if name == oldName {
			list[i] = newPath.Base()
		}
	}

	return WriteSortFile(oldDir, list)
}
