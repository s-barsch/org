package tags

import (
	"bufio"
	"org/server/search"
	"sort"
	"strings"
	"unicode"
)

type Tags map[string][]*search.File

func (t Tags) Add(files []*search.File) {
	for _, f := range files {
		for _, tag := range extractTags(f.String()) {
			indexedFiles := t[tag]
			if indexedFiles != nil && indexedFiles[len(indexedFiles)-1].Path == f.Path {
				// Don't add same ID twice.
				continue
			}
			t[tag] = append(indexedFiles, f)
		}
	}
	for tag := range t {
		files := t[tag]
		sort.Sort(search.ByDate(files))
		t[tag] = files
	}
}

func extractTags(text string) []string {
	scanner := bufio.NewScanner(strings.NewReader(text))
	scanner.Split(bufio.ScanWords)
	tags := []string{}
	for scanner.Scan() {
		lc := rune(scanner.Text()[len(scanner.Text())-1])
		if scanner.Text()[0] == '>' && (unicode.IsLetter(lc) || unicode.IsNumber(lc)) {
			tags = append(tags, scanner.Text()[1:])
		}
	}
	return tags
}
