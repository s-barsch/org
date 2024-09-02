package index

import (
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"time"
)

func New(build, root string) *Index {
	path, err := filepath.EvalSymlinks(root)
	if err != nil {
		panic(err)
	}
	return &Index{
		Root:   path,
		Build:  build,
		Words:  map[string][]*File{},
		Tags:   map[string][]*File{},
		Status: make(chan string, 100),
	}
}

func (ix *Index) Load() error {
	start := time.Now()
	err := ix.Read()
	if err != nil {
		log.Fatal(err)
		return err
	}
	log.Printf("Read %d documents in %v", len(ix.Files), time.Since(start))

	start = time.Now()
	ix.Tokenize()
	log.Printf("Tokenized %d documents in %v", len(ix.Files), time.Since(start))

	start = time.Now()
	ix.ParseTags()
	log.Printf("Extracted tags in %v", time.Since(start))

	return nil
}

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
