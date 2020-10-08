package main

import (
	"encoding/json"
	"net/http"
)

type View struct {
	File   *File  `json:"file"`
	Parent string `json:"parent"`
}

func dirListing(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "dirListing",
		Path: path,
		Code: 500,
	}

	files, err := getFiles(path)
	if err != nil {
		e.Err = err
		return e
	}

	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}
