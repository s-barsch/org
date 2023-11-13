package path

import (
	"os"
	fp "path/filepath"
	"strings"
)

type Path struct {
	Root string
	Rel  string
}

func (p *Path) IsFile() bool {
	return strings.Contains(p.Rel, ".")
}

func (p *Path) Parent() *Path {
	return &Path{Rel: fp.Dir(p.Rel)}
}

func (p *Path) Base() string {
	return fp.Base(p.Rel)
}

func (p *Path) Abs() string {
	return p.Root + p.Rel
}

func (p *Path) Exists() bool {
	return Exists(p.Abs())
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
