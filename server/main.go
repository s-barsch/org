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

	r.HandleFunc("/view/", view)

	return r
}

func view(w http.ResponseWriter, r *http.Request) {
	files, err := getFiles("/home/stef/org" + r.URL.Path[len("/view/"):])
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
