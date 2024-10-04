package path

import (
	"fmt"
	"os"
	fp "path/filepath"
	"strings"
)

type Path struct {
	Root string
	Path string
}

func (p *Path) New(path string) *Path {
	return &Path{
		Path: path,
		Root: p.Root,
	}
}

func (p *Path) IsFile() bool {
	return strings.Contains(p.Path, ".")
}

func (p *Path) Parent() *Path {
	return &Path{
		Root: p.Root,
		Path: fp.Dir(p.Path),
	}
}

func (p *Path) Base() string {
	return fp.Base(p.Path)
}

func (p *Path) Abs() string {
	if p.Root == "" {
		panic(fmt.Sprintf("*path.Path.Root shall never be empty (%v)", p.Path))
	}
	return p.Root + p.Path
}

func (p *Path) Ext() string {
	return fp.Ext(p.Path)
}

func (p *Path) Exists() bool {
	return Exists(p.Abs())
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
