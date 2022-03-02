package fts

/*
import (
	"flag"
	"log"
	"time"
)

func main() {
	var root, query string
	flag.StringVar(&root, "p", ".", "path of text files to read")
	flag.StringVar(&query, "q", "", "search query")
	flag.Parse()

	start := time.Now()
	files, err := readFiles(root)
	if err != nil {
		log.Println(err)
		return
	}
	log.Printf("Loaded %d documents in %v", len(files), time.Since(start))


	start = time.Now()
	idx := make(index)
	idx.add(files)
	log.Printf("Indexed %d documents in %v", len(files), time.Since(start))

	start = time.Now()
	matchedPaths := idx.search(query)
	log.Printf("Search found %d documents in %v", len(matchedPaths), time.Since(start))

	for _, path := range matchedPaths {
		for _, f := range files {
			if path == f.Path {
				log.Printf("%v\n\n%v\n\n", path, f.String())
			}
		}
	}

	log.Printf("Search found %d documents in %v", len(matchedPaths), time.Since(start))
}
*/


