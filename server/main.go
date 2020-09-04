package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"os"
	"io/ioutil"
	"log"
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
	path := r.URL.Path[len("/api"):]

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = ioutil.WriteFile(ROOT+path, body, 0664)
	if err == nil {
		log.Printf("written.\n{%s}\n", body)
	}
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
	case filetype(path) == "text":
		textContent(w, path)
	}
}
