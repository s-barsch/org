package fts

// from https://github.com/akrylysov/simplefts

import (
	"log"
)

// index is an inverted index. It maps tokens to document IDs.
type Index map[string][]string

// add adds documents to the index.
func (idx Index) Add(files []*File) {
	for _, f := range files {
		for _, token := range analyze(f.String()) {
			paths := idx[token]
			if paths != nil && paths[len(paths)-1] == f.Path {
				// Don't add same ID twice.
				continue
			}
			idx[token] = append(paths, f.Path)
		}
	}
}

/*
// intersection returns the set intersection between a and b.
// a and b have to be sorted in ascending order and contain no duplicates.
func intersection(a []string, b []string) []string{
	maxLen := len(a)
	if len(b) > maxLen {
		maxLen = len(b)
	}
	r := make([]int, 0, maxLen)
	var i, j int
	for i < len(a) && j < len(b) {
		if a[i] < b[j] {
			i++
		} else if a[i] > b[j] {
			j++
		} else {
			r = append(r, a[i])
			i++
			j++
		}
	}
	return r
}
*/

// search queries the index for the given text.
func (idx Index) Search(text string) []string {
	var r []string
	for _, token := range analyze(text) {
		if paths, ok := idx[token]; ok {
			if r == nil {
				r = paths
			} else {
				log.Println("intersection not implemented")			
				//r = intersection(r, ids)
			}
		} else {
			// Token doesn't exist.
			return nil
		}
	}
	return r
}
