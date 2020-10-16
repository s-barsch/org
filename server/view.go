package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	p "path/filepath"
	"strings"
	"time"
)

type DirView struct {
	Nav   *Nav     `json:"nav"`
	Path   string  `json:"path"`  
	Files  []*File `json:"files"`
	Sorted bool    `json:"sorted"`
}

func viewFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/view"):]

	e := &Err{
		Func: "viewFile",
		Path: path,
		Code: 500,
	}

	if strings.Contains(path, ".") {
		path = p.Dir(path)
	}

	_, err := os.Stat(ROOT + path)
	if err != nil {
		e.Err = fmt.Errorf("Not found %v", path)
		e.Code = 404
		return e
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
		Nav:   nav,
		Path:   path,

		Files:  files,
		Sorted: sorted,
	}

	err = json.NewEncoder(w).Encode(v)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func serveStatic(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/file"):]

	/*
		e := &Err{
			Func: "serveStatic",
			Path: path,
			Code: 500,
		}

		if fileType(path) == "text" {
			b, err := ioutil.ReadFile(ROOT + path)
			if err != nil {
				if p.Ext(path) == ".info" {
					// dummy requests arrive, because of attached info field
					return nil
				}
				e.Err = err
				return e
			}

			fmt.Fprintf(w, "%s", removeNewLine(b))
			return nil
		}
	*/

	http.ServeFile(w, r, ROOT+path)

	return nil
}

func viewLinks(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "viewLinks",
		Code: 500,
	}

	err := json.NewEncoder(w).Encode(siteConfig.Links)
	if err != nil {
		e.Err = err
		return e
	}
	return nil
}

func todayRedirect(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "todayRedirect",
		Code: 500,
	}

	path, err := getCurrent()
	if err != nil {
		e.Err = err
		return e
	}

	http.Redirect(w, r, path, 307)
	return nil
}

func getToday(w http.ResponseWriter, r *http.Request) *Err {
	e := &Err{
		Func: "getToday",
		Code: 500,
	}

	path, err := getCurrent()
	if err != nil {
		e.Err = err
		return e
	}

	fmt.Fprint(w, path)
	return nil
}

func getCurrent() (string, error) {
	path := currentDatePath()
	_, err := os.Stat(path)
	if err != nil {
		err := os.MkdirAll(ROOT+path, 0755)
		if err != nil {
			return "", err
		}
	}
	return path, nil
}

func currentDatePath() string {
	t := time.Now()
	if t.Hour() < 6 {
		t = time.Now().AddDate(0, 0, -1)
	}
	return fmt.Sprintf("/private/graph/%v", t.Format("06/06-01/02"))
}
