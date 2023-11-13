package main

import (
	"log"
	"net/http"
	"org/server/api/crud"
	"org/server/api/delete"
	"org/server/api/nav"
	"org/server/api/search"
	"org/server/api/sort"
	"org/server/api/today"
	"org/server/api/topics"
	"org/server/api/view"
	"org/server/helper"
	"org/server/index"
	"os"

	"github.com/gorilla/mux"
)

func routes() *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/file/").HandlerFunc(hix(IX, view.ServeStatic))

	r.HandleFunc("/api/today", hix(IX, today.GetToday))
	r.HandleFunc("/api/now", hix(IX, today.GetNow))

	r.PathPrefix("/api/nav").HandlerFunc(hix(IX, nav.ViewNav))

	r.PathPrefix("/api/view").HandlerFunc(hix(IX, view.ViewFile))
	r.PathPrefix("/api/copy").HandlerFunc(hix(IX, crud.CopyFile))
	r.PathPrefix("/api/move").HandlerFunc(hix(IX, crud.RenameFile))
	r.PathPrefix("/api/write").HandlerFunc(hix(IX, crud.WriteSwitch))
	r.PathPrefix("/api/delete").HandlerFunc(hix(IX, delete.DeleteFile))
	r.PathPrefix("/api/sort").HandlerFunc(hix(IX, sort.WriteSort))
	r.PathPrefix("/api/search").HandlerFunc(hix(IX, search.SearchFiles))
	r.PathPrefix("/api/topics/").HandlerFunc(hix(IX, topics.ViewTopic))
	r.PathPrefix("/api/topics").HandlerFunc(hix(IX, topics.Topics))

	r.PathPrefix("/rl/").HandlerFunc(reloadIndex)

	r.PathPrefix("/").HandlerFunc(serveBuild)

	return r
}

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

func reloadIndex(w http.ResponseWriter, r *http.Request) {
	err := loadIndex()
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func h(fn func(http.ResponseWriter, *http.Request) *helper.Err) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := fn(w, r)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), err.Code)
		}
	}
}

func hix(ix *index.Index, fn func(*index.Index, http.ResponseWriter, *http.Request) *helper.Err) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := fn(ix, w, r)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), err.Code)
		}
	}
}
