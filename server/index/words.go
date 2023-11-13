package index

import (
	"strings"
	"unicode"

	snowballde "github.com/antonbaumann/german-go-stemmer"
)

// from https://github.com/akrylysov/simplefts

// index is an inverted  It maps tokens to document IDs.
type Words map[string][]*File

func (w Words) AddFiles(files []*File) {
	for _, f := range files {
		w.AddFile(f)
	}
}

func (w Words) AddFile(f *File) {
	for _, token := range analyze(f.String()) {
		indexedFiles := w[token]
		if indexedFiles != nil && indexedFiles[len(indexedFiles)-1].Path == f.Path {
			// Don't add same ID twice.
			continue
		}
		w[token] = append(indexedFiles, f)
	}
}

// intersection returns the set intersection between a and b.
// a and b have to be sorted in ascending order and contain no duplicates.
func intersection(a []*File, b []*File) []*File {
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
func (w Words) Search(text string) []*File {
	var r []*File
	for _, token := range analyze(text) {
		if paths, ok := w[token]; ok {
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

// lowercaseFilter returns a slice of tokens normalized to lower case.
func lowercaseFilter(tokens []string) []string {
	r := make([]string, len(tokens))
	for i, token := range tokens {
		r[i] = strings.ToLower(token)
	}
	return r
}

// stopwordFilter returns a slice of tokens with stop words removed.
func stopwordFilter(tokens []string) []string {
	var stopwords = map[string]struct{}{
		"a": {}, "and": {}, "be": {}, "have": {}, "i": {},
		"in": {}, "of": {}, "that": {}, "the": {}, "to": {},
	}
	r := make([]string, 0, len(tokens))
	for _, token := range tokens {
		if _, ok := stopwords[token]; !ok {
			r = append(r, token)
		}
	}
	return r
}

// stemmerFilter returns a slice of stemmed tokens.
func stemmerFilter(tokens []string) []string {
	r := make([]string, len(tokens))
	for i, token := range tokens {
		r[i] = snowballde.StemWord(token)
	}
	return r
}

// tokenize returns a slice of tokens for the given text.
func tokenize(text string) []string {
	return strings.FieldsFunc(text, func(r rune) bool {
		// Split on any character that is not a letter or a number.
		return !unicode.IsLetter(r) && !unicode.IsNumber(r)
	})
}

// analyze analyzes the text and returns a slice of tokens.
func analyze(text string) []string {
	tokens := tokenize(text)
	tokens = lowercaseFilter(tokens)
	tokens = stopwordFilter(tokens)
	tokens = stemmerFilter(tokens)
	return tokens
}
