package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"os"
)

func main() {
	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}

func routes() *mux.Router {
	r := mux.NewRouter()

	api := r.PathPrefix("/api/").Subrouter()
	api.Methods("GET").HandlerFunc(view)
	api.Methods("POST").HandlerFunc(write)

	return r
}

var ROOT = "org"

func write(w http.ResponseWriter, r *http.Request) {
	println(r.URL.Path)
}

func view(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	fi, err := os.Stat(ROOT + path)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	switch {
	case fi.IsDir():
		dirListing(w, path)

	case fileType(path) == "text":
		textContent(w, path)
	}
}
