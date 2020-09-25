package main

import (
	"io/ioutil"
	"net/http"
//	"encoding/json"
	"log"
	"fmt"
//  "path/filepath"
)

type View struct {
	File   *File   `json:"file"`
	Parent string  `json:"parent"`
	Files  []*File `json:"files,omitempty"`
}

/*
func dirListing(w http.ResponseWriter, path string) {
	files, err := getFiles(path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = json.NewEncoder(w).Encode()
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
}
*/

func textContent(w http.ResponseWriter, path string) {
	b, err := ioutil.ReadFile(ROOT + path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
	fmt.Fprintf(w, "%s", b)
}


