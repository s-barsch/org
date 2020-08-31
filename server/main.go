package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"encoding/json"
)

func main() {
	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}

func routes() *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/api/view/").HandlerFunc(view)

	return r
}

var ROOT = "/home/stef/org"

func view(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api/view"):]
	files, err := getFiles(path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
}
