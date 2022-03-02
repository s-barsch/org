package main
/*

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	p "path/filepath"
	"strings"
	"time"
)

func search(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/search"):]

	e := &Err{
		Func: "search",
		Path: path,
		Code: 500,
	}

	files, sorted, err := getFiles(path)
	if err != nil {
		e.Err = err
		return e
	}

	if files == nil {
		files = []*File{}
	}

	nav, err := getNav(path)
	if err != nil {
		e.Err = err
		return e
	}

	v := &DirView{
		Path: path,
		Nav:  nav,
		Main: &Main{
			Files:  files,
			Sorted: sorted,
		},
	}

	err = json.NewEncoder(w).Encode(v)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}
*/
