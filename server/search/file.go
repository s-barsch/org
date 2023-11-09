package search

import (
	"path/filepath"
	"unicode"
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

type ByDate []*File

func (a ByDate) Len() int      { return len(a) }
func (a ByDate) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByDate) Less(i, j int) bool {
	if unicode.IsLetter(rune(a[i].Name()[0])) {
		return false
	}
	return a[i].Name() > a[j].Name()
}
