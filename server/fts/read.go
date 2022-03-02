package fts

import (
	"os"
	"io/fs"
	"path/filepath"
)

type File struct {
	Path string
	Byte []byte
}

func (f *File) String() string {
	return string(f.Byte)
}

func ReadFiles(root string) ([]*File, error) {
	files := []*File{}

	wfn := func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if x := filepath.Ext(path); x != ".txt" && x != ".info" {
			return nil
		}
		f, err := readFile(path)
		if err != nil {
			return err
		}
		files = append(files, f)
		return nil
	}

	err := filepath.WalkDir(root, wfn)

	if err != nil {
		return nil, err
	}
	return files, nil
}

func readFile(path string) (*File, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return &File{
		Path: path,
		Byte: b,
	}, nil
}
