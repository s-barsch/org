package index

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
