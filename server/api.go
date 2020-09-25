package main

import (
	"io/ioutil"
	"net/http"
	"encoding/json"
	"log"
	"fmt"
//  "path/filepath"
)

type View struct {
	File   *File   `json:"file"`
	Parent string  `json:"parent"`
}

func dirListing(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	files, err := getFiles(path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}

	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
}

func textContent(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	b, err := ioutil.ReadFile(ROOT + path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
	fmt.Fprintf(w, "%s", b)
}


