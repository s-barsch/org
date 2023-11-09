package main

import (
	"log"
	"org/server/search"
	fts "org/server/search/full-text"
	"org/server/search/tags"
	"path/filepath"
	"time"
)

type Index struct {
	Files []*search.File
	Words fts.Words
	Tags  tags.Tags
}

var IX Index

func (ix Index) Read(path string) error {
	files, err := fts.ReadFiles(path, "/private/graph")
	if err != nil {
		return err
	}
	ix.Files = files
	return nil
}

func (ix Index) Tokenize() {
	IX.Words = make(fts.Words)
	IX.Words.Add(ix.Files)
}

func (ix Index) ParseTags() {
	IX.Tags = make(tags.Tags)
	IX.Tags.Add(IX.Files)
}

func loadIndex() error {
	path, err := filepath.EvalSymlinks(ROOT)
	if err != nil {
		return err
	}

	start := time.Now()
	err = IX.Read(path)
	if err != nil {
		return err
	}
	log.Printf("Read %d documents in %v", len(IX.Files), time.Since(start))

	start = time.Now()
	IX.Tokenize()
	log.Printf("Tokenized %d documents in %v", len(IX.Files), time.Since(start))

	start = time.Now()
	IX.ParseTags()
	log.Printf("Extracted tags in %v", time.Since(start))

	return nil
}
