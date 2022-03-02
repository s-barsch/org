package main

import (
	"log"
	"org/server/fts"
	"time"
	"path/filepath"
)

var idx fts.Index

func loadIndex(root string) error {
	path, err := filepath.EvalSymlinks(root)
	if err != nil {
		return err
	}

	start := time.Now()
	files, err := fts.ReadFiles(filepath.Join(path, "/private/graph"))
	if err != nil {
		return err
	}
	log.Printf("Loaded %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	idx = make(fts.Index)
	idx.Add(files)
	log.Printf("Indexed %d documents in %v", len(files), time.Since(start))
	return nil
}


