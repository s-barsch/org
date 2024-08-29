package routes

import (
	"log"
	"net/http"
	"os"

	"g.sacerb.com/org/go/api/crud"
	"g.sacerb.com/org/go/api/kine"
	"g.sacerb.com/org/go/api/nav"
	"g.sacerb.com/org/go/api/search"
	"g.sacerb.com/org/go/api/today"
	"g.sacerb.com/org/go/api/topics"
	"g.sacerb.com/org/go/api/view"
	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/index"

	"github.com/gorilla/mux"
)

func Routes(ix *index.Index) *mux.Router {
	r := mux.NewRouter()

	r.PathPrefix("/file/").HandlerFunc(hix(ix, view.ServeStatic))

	r.HandleFunc("/api/today", hix(ix, today.GetToday))
	r.HandleFunc("/api/now", hix(ix, today.GetNow))

	r.PathPrefix("/api/nav").HandlerFunc(hix(ix, nav.ViewNav))

	r.PathPrefix("/api/view").HandlerFunc(hix(ix, view.ViewFile))
	r.PathPrefix("/api/copy").HandlerFunc(hix(ix, crud.CopyFile))
	r.PathPrefix("/api/move").HandlerFunc(hix(ix, crud.RenameFile))
	r.PathPrefix("/api/write").HandlerFunc(hix(ix, crud.WriteSwitch))
	r.PathPrefix("/api/delete").HandlerFunc(hix(ix, crud.DeleteFile))
	r.PathPrefix("/api/sort").HandlerFunc(hix(ix, crud.WriteSort))
	r.PathPrefix("/api/search").HandlerFunc(hix(ix, search.SearchFiles))
	r.PathPrefix("/api/topics/").HandlerFunc(hix(ix, topics.ViewTopic))
	r.PathPrefix("/api/topics").HandlerFunc(hix(ix, topics.Topics))
	r.PathPrefix("/api/kines").HandlerFunc(hix(ix, kine.Kines))
	r.PathPrefix(kine.CreateAPI).HandlerFunc(hix(ix, kine.Create))
	r.PathPrefix(kine.UploadAPI).HandlerFunc(hix(ix, kine.Upload))

	r.PathPrefix("/rl/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := ix.Load()
		if err != nil {
			http.Error(w, err.Error(), 500)
		}
	})

	r.PathPrefix("/").HandlerFunc(buildWrapper(ix, serveBuild))

	return r
}

func buildWrapper(ix *index.Index, fn func(*index.Index, http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fn(ix, w, r)
	}
}

func serveBuild(ix *index.Index, w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		file := ix.Build + r.URL.Path
		_, err := os.Stat(file)
		if err == nil {
			http.ServeFile(w, r, file)
			return
		}
	}
	http.ServeFile(w, r, ix.Build+"/index.html")
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
