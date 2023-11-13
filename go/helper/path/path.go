package path

import (
	"fmt"
	"os"
	fp "path/filepath"
	"strings"
)

type Path struct {
	Root string
	Rel  string
}

func (p *Path) New(rel string) *Path {
	return &Path{
		Rel:  rel,
		Root: p.Root,
	}
}

func (p *Path) IsFile() bool {
	return strings.Contains(p.Rel, ".")
}

func (p *Path) Parent() *Path {
	return &Path{
		Root: p.Root,
		Rel:  fp.Dir(p.Rel),
	}
}

func (p *Path) Base() string {
	return fp.Base(p.Rel)
}

func (p *Path) Abs() string {
	if p.Root == "" {
		panic(fmt.Sprintf("*path.Path.Root shall never be empty (%v)", p.Rel))
	}
	return p.Root + p.Rel
}

func (p *Path) Ext() string {
	return fp.Ext(p.Rel)
}

func (p *Path) Exists() bool {
	return Exists(p.Abs())
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
