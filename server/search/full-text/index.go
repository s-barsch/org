package fts

import "org/server/search"

// from https://github.com/akrylysov/simplefts

// index is an inverted index. It maps tokens to document IDs.
type Index map[string][]*search.File

// add adds documents to the index.
func (idx Index) Add(files []*search.File) {
	for _, f := range files {
		for _, token := range analyze(f.String()) {
			indexedFiles := idx[token]
			if indexedFiles != nil && indexedFiles[len(indexedFiles)-1].Path == f.Path {
				// Don't add same ID twice.
				continue
			}
			idx[token] = append(indexedFiles, f)
		}
	}
}

// intersection returns the set intersection between a and b.
// a and b have to be sorted in ascending order and contain no duplicates.
func intersection(a []*search.File, b []*search.File) []*search.File {
	maxLen := len(a)
	if len(b) > maxLen {
		maxLen = len(b)
	}
	r := make([]*search.File, 0, maxLen)
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
func (idx Index) Search(text string) []*search.File {
	var r []*search.File
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
