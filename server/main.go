package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}

func routes() *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/file/").HandlerFunc(h(serveStatic))

	api := r.PathPrefix("/api/").Subrouter()
	api.Methods("GET").Queries("listing", "true").HandlerFunc(h(viewListing))
	api.Methods("GET").HandlerFunc(h(viewFile))
	api.Methods("POST").HandlerFunc(h(writeSwitch))
	api.Methods("PUT").HandlerFunc(h(renameFile))
	api.Methods("DELETE").HandlerFunc(h(deleteFile))

	return r
}

func h(fn func(http.ResponseWriter, *http.Request) *Err) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := fn(w, r)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), err.Code)
		}
	}
}

type Err struct {
	Func string
	Path string
	Code int
	Err  error
}

func (e *Err) Error() string {
	return e.Err.Error()
}

var ROOT = "org"
