package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

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

	r.HandleFunc("/api/today", h(getToday))
	r.HandleFunc("/api/now", h(getNow))

	r.PathPrefix("/api/sort").HandlerFunc(h(writeSort))
	r.PathPrefix("/api/copy").HandlerFunc(h(copyFile))
	r.PathPrefix("/api/move").HandlerFunc(h(renameFile))
	r.PathPrefix("/api/delete").HandlerFunc(h(deleteFile))
	r.PathPrefix("/api/write").HandlerFunc(h(writeSwitch))
	r.PathPrefix("/api/view").HandlerFunc(h(viewFile))

	r.PathPrefix("/").HandlerFunc(serveBuild)

	return r
}

const BUILD = "build"

func serveBuild(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		file := BUILD + r.URL.Path
		_, err := os.Stat(file)
		if err == nil {
			http.ServeFile(w, r, file)
			return
		}
	}
	http.ServeFile(w, r, BUILD+"/index.html")
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
	return fmt.Sprintf("%v: %v (%d)\npath: %v", e.Func, e.Err.Error(), e.Code, e.Path)
}

var ROOT = "org"
