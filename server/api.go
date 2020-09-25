package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
)

type View struct {
	File   *File  `json:"file"`
	Parent string `json:"parent"`
}

func dirListing(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	files, err := getFiles(path)
	if err != nil {
		err = fmt.Errorf("dirListing: %v", err.Error())
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}

	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		err = fmt.Errorf("dirListing: %v", err.Error())
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
}

func textContent(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	b, err := ioutil.ReadFile(ROOT + path)
	if err != nil {
		if filepath.Ext(path) == ".info" {
			return
		}
		err = fmt.Errorf("textContent: %v", err.Error())
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
	fmt.Fprintf(w, "%s", b)
}
