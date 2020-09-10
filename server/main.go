package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"os"
	"io/ioutil"
	"log"
	"strings"
	"path/filepath"
)

func main() {
	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}

func routes() *mux.Router {
	r := mux.NewRouter()

	api := r.PathPrefix("/api/").Subrouter()
	api.Methods("GET").HandlerFunc(view)
	api.Methods("POST").HandlerFunc(writeSwitch)
	api.Methods("DELETE").HandlerFunc(deleteFile)

	return r
}

var ROOT = "org"

func deleteFile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	err := os.Remove(ROOT+path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
}

func writeSwitch(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	if strings.Contains(path, ".") {
		writeFile(w, r)
		return
	}
	createDir(w, r)
}

func createDir(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]
	fi, err := os.Stat(ROOT+filepath.Dir(path))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if !fi.IsDir() {
		http.Error(w, "Can’t create dir in non-dir.", 500)
		return
	}
	err = os.Mkdir(ROOT + path, 0755)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	return
}

func writeFile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path[len("/api"):]

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = ioutil.WriteFile(ROOT+path, body, 0664)
	if err == nil {
		log.Printf("writeFile:\n{%s}\n", body)
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
