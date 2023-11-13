package index

import (
	"io/fs"
	"os"
	"path/filepath"
)

// root is path of the project. folder is a specified subfolder of that project.
func ReadFiles(root, folder string) ([]*File, error) {
	files := []*File{}

	wfn := func(abs string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if x := filepath.Ext(abs); x != ".txt" && x != ".info" {
			return nil
		}
		f, err := ReadFile(root, abs)
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

func ReadFile(root, abs string) (*File, error) {
	b, err := os.ReadFile(abs)
	if err != nil {
		return nil, err
	}
	return &File{
		Path: abs[len(root):],
		Byte: b,
	}, nil
}
