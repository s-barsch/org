package main

import (
	"encoding/json"
	"net/http"
)

func topics(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "topics",
		Code: 500,
	}

	tags := []string{}
	for t := range TAGS {
		tags = append(tags, t)
	}

	err := json.NewEncoder(w).Encode(tags)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func topic(w http.ResponseWriter, r *http.Request) *Err {
	topic := r.URL.Path[len("/api/topics/"):]
	indexed := TAGS[topic]

	e := &Err{
		Func: "topic",
		Path: topic,
		Code: 500,
	}

	files := []*File{}
	for i, f := range indexed {
		files = append(files, &File{
			Num:  i,
			Path: f.Path,
			Name: f.Name(),
			Type: "text",
			Body: f.String(),
		})
	}

	v := &DirView{
		Path: topic,
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
