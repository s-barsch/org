package fts

import (
	"io/fs"
	"org/server/search"
	"os"
	"path/filepath"
)

// root is path of the project. folder is a specified subfolder of that project.
func ReadFiles(root, folder string) ([]*search.File, error) {
	files := []*search.File{}

	wfn := func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if x := filepath.Ext(path); x != ".txt" && x != ".info" {
			return nil
		}
		f, err := readFile(root, path)
		if err != nil {
			return err
		}
		files = append(files, f)
		return nil
	}

	err := filepath.WalkDir(filepath.Join(root, folder), wfn)

	if err != nil {
		return nil, err
	}
	return files, nil
}

func readFile(root, path string) (*search.File, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return &search.File{
		Path: path[len(root):],
		Byte: b,
	}, nil
}
