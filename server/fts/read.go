package fts

import (
	"io/fs"
	"os"
	"path/filepath"
)

type File struct {
	Path string
	Byte []byte
}

func (f *File) Name() string {
	return filepath.Base(f.Path)
}

func (f *File) String() string {
	return string(f.Byte)
}

// root is path of the project. folder is a specified subfolder of that project.
func ReadFiles(root, folder string) ([]*File, error) {
	files := []*File{}

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

func readFile(root, path string) (*File, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return &File{
		Path: path[len(root):],
		Byte: b,
	}, nil
}
