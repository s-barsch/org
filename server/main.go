package main

import (
	"net/http"
	"github.com/gorilla/mux"
	"log"
	"os"
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

	fi, err := os.Stat(ROOT + path)
	if err != nil {
		http.NotFound(w, r)
		log.Println(err)
		return
	}

	if fi.IsDir() {
		dirListing(w, path)
		return
	}

	if typ(path, false) == "text" {
		textContent(w, path)
		return
	}
}
