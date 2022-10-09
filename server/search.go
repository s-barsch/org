package main

import (
	"encoding/json"
	"net/http"
)

func search(w http.ResponseWriter, r *http.Request) *Err {
	query := r.URL.Path[len("/api/search"):]

	e := &Err{
		Func: "search",
		Path: query,
		Code: 500,
	}

	files := []*File{}
	matches := IDX.Search(query)

	for i, f := range matches {
		files = append(files, &File{
			Num:  i,
			Path: f.Path,
			Name: f.Name(),
			Type: "text",
			Body: f.String(),
		})
	}

	v := &DirView{
		Path: query,
		// Nav:  nav,
		Dir: &Dir{
			Files:  files,
			Sorted: false,
		},
	}

	err := json.NewEncoder(w).Encode(v)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}
