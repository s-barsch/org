package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

var siteConfig *Config

func main() {
	c, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	siteConfig = c

	http.Handle("/", routes())
	http.ListenAndServe(":8334", nil)
}

func routes() *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/file/").HandlerFunc(h(serveStatic))

	r.HandleFunc("/api/links", h(viewLinks))
	r.HandleFunc("/api/today", h(viewToday))

	r.PathPrefix("/api/sort").HandlerFunc(h(writeSort))
	r.PathPrefix("/api/copy").HandlerFunc(h(copyFile))
	r.PathPrefix("/api/move").HandlerFunc(h(renameFile))
	r.PathPrefix("/api/list").HandlerFunc(h(viewListing))
	r.PathPrefix("/api/delete").HandlerFunc(h(deleteFile))
	r.PathPrefix("/api/write").HandlerFunc(h(writeSwitch))
	r.PathPrefix("/api/view").HandlerFunc(h(viewFile))
	r.PathPrefix("/api/dupli").HandlerFunc(h(duplicateFile))


	/*
	api := r.PathPrefix("/api").Subrouter()
	api.Methods("GET").HandlerFunc(h(viewFile))
	api.Methods("POST").HandlerFunc(h(writeSwitch))
	//api.Methods("DELETE").HandlerFunc(h(deleteFile))
	*/


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
	return fmt.Sprintf("%v: %v (%d)\n%v", e.Func, e.Err.Error(), e.Code, e.Path)
}

var ROOT = "org"
