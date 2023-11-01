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
