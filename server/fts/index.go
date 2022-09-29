package fts

// from https://github.com/akrylysov/simplefts

import (
)

// index is an inverted index. It maps tokens to document IDs.
type Index map[string][]*File

// add adds documents to the index.
func (idx Index) Add(files []*File) {
	for _, f := range files {
		for _, token := range analyze(f.String()) {
			files := idx[token]
			if files != nil && files[len(files)-1].Path == f.Path {
				// Don't add same ID twice.
				continue
			}
			idx[token] = append(files, f)
		}
	}
}

// intersection returns the set intersection between a and b.
// a and b have to be sorted in ascending order and contain no duplicates.
func intersection(a []*File, b []*File) []*File{
	maxLen := len(a)
	if len(b) > maxLen {
		maxLen = len(b)
	}
	r := make([]*File, 0, maxLen)
	var i, j int
	for i < len(a) && j < len(b) {
		if a[i].Path < b[j].Path {
			i++
		} else if a[i].Path > b[j].Path {
			j++
		} else {
			r = append(r, a[i])
			i++
			j++
		}
	}
	return r
}

// search queries the index for the given text.
func (idx Index) Search(text string) []*File {
	var r []*File
	for _, token := range analyze(text) {
		if paths, ok := idx[token]; ok {
			if r == nil {
				r = paths
			} else {
				r = intersection(r, paths)
			}
		} else {
			// Token doesn't exist.
			return nil
		}
	}
	return r
}
