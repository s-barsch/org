package main

import (
	"log"
	fts "org/server/search/full-text"
	"org/server/search/tags"
	"path/filepath"
	"time"
)

var IDX fts.Index
var TAGS tags.Tags

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
	log.Printf("Loaded %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	IDX = make(fts.Index)
	IDX.Add(files)
	log.Printf("Indexed %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	TAGS = make(tags.Tags)
	TAGS.Add(files)
	log.Printf("Extracted tags in %v", time.Since(start))

	for k := range TAGS {
		log.Println(k)
	}
	return nil
}
