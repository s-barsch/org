package search

import "path/filepath"

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
