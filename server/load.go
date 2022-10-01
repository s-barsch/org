package main

import (
	"log"
	"org/server/fts"
	"path/filepath"
	"time"
)

var IDX fts.Index

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
	return nil
}
