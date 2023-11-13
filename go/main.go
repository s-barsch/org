package main

import (
	"log"
	"net/http"
	"path/filepath"
)

var ROOT = "data"
var BUILD = "build"

func main() {
	path, err := filepath.EvalSymlinks(ROOT)
	if err != nil {
		log.Fatal(err)
	}
	ROOT = path

	go loadIndex()

	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}
