package main

import (
	"io/ioutil"
	"net/http"
	"encoding/json"
	"log"
	"fmt"
)

func dirListing(w http.ResponseWriter, path string) {
	files, err := getFiles(path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
}

func textContent(w http.ResponseWriter, path string) {
	b, err := ioutil.ReadFile(ROOT + path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		log.Println(err)
		return
	}
	fmt.Fprintf(w, "%s", b)
}


