package main

import (
	"log"
	"org/server/index"
	"org/server/index/tags"
	"org/server/index/words"
	"time"
)

type Index struct {
	Files []*index.File
	Words words.Words
	Tags  tags.Tags
}

var IX = &Index{}

func (ix *Index) Read(path string) error {
	files, err := words.ReadFiles(path, "/private/graph")
	if err != nil {
		return err
	}
	println(len(files))
	ix.Files = files
	return nil
}

func (ix *Index) Tokenize() {
	ix.Words = make(words.Words)
	ix.Words.AddFiles(ix.Files)
}

func (ix *Index) ParseTags() {
	ix.Tags = make(tags.Tags)
	ix.Tags.AddFiles(ix.Files)
}

func (ix *Index) AddFile(path string) {
	f, err := words.ReadFile(ROOT, path)
	if err != nil {
		log.Println(err)
		return
	}
	ix.TokenizeFile(f)
	ix.Files = append(ix.Files, f)
}

func (ix *Index) TokenizeFile(f *index.File) {
	ix.Words.AddFile(f)
	ix.Tags.AddFile(f)
}

func (ix *Index) UpdateFile(path string) {
	nf, err := words.ReadFile(ROOT, path)
	if err != nil {
		log.Println(err)
		return
	}
	ix.TokenizeFile(nf)
	for i, f := range ix.Files {
		if f.Path == path {
			ix.Files[i] = nf
			return
		}
	}
	ix.Files = append(ix.Files, nf)
	log.Printf("Couldnt update file %v", path)
}

func (ix *Index) RemoveFile(path string) {
	for i, f := range ix.Files {
		if f.Path == path {
			ix.Files[i] = ix.Files[len(ix.Files)-1]
			ix.Files = ix.Files[:len(ix.Files)-1]
			return
		}
	}
	//TODO: file is not used from tokenized structures
	log.Printf("Couldnt remove file %v", path)
}

func loadIndex() error {
	start := time.Now()
	err := IX.Read(ROOT)
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
