package main

import (
	"log"
	fts "org/server/search/full-text"
	"org/server/search/tags"
	"path/filepath"
	"time"
)

type Index struct {
	Words fts.Words
	Tags  tags.Tags
}

var IX Index

func loadIndex(root string) error {
	path, err := filepath.EvalSymlinks(root)
	if err != nil {
		return err
	}

	start := time.Now()
	files, err := fts.ReadFiles(path, "/private/graph")
	if err != nil {
		return err
	}
	log.Printf("Read %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	IX.Words = make(fts.Words)
	IX.Words.Add(files)
	log.Printf("Tokenized %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	IX.Tags = make(tags.Tags)
	IX.Tags.Add(files)
	log.Printf("Extracted tags in %v", time.Since(start))

	return nil
}
