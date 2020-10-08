package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type View struct {
	File   *File  `json:"file"`
	Parent string `json:"parent"`
}

func viewListing(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "dirListing",
		Path: path,
		Code: 500,
	}

	files, err := getFiles(path)
	if err != nil {
		e.Err = err
		return e
	}

	err = json.NewEncoder(w).Encode(files)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func renameFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "renameFile",
		Path: path,
		Code: 500,
	}

	newPath, err := getRenamePath(r)
	if err != nil {
		e.Err = err
		return e
	}

	err = os.Rename(ROOT+path, ROOT+newPath)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func getRenamePath(r *http.Request) (string, error) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return "", err
	}

	// TODO: make sure it’s a valid path

	path := string(body)

	return path, nil
}

func deleteFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "deleteFile",
		Path: path,
		Code: 500,
	}

	err := os.Remove(ROOT + path)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func rmFile(path string) error {
	_, err := os.Stat(path)
	if err != nil {
		return nil
	}
	return os.Remove(path)
}

func writeSwitch(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	if strings.Contains(path, ".") || filepath.Base(path) == "info" {
		return writeFile(w, r)
	}
	return createDir(w, r)
}

func createDir(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "createDir",
		Path: path,
		Code: 500,
	}

	fi, err := os.Stat(ROOT + filepath.Dir(path))
	if err != nil {
		e.Err = err
		return e
	}
	if !fi.IsDir() {
		e.Err = fmt.Errorf("Can’t create dir in non-dir.")
		return e
	}
	err = os.Mkdir(ROOT+path, 0755)
	if err != nil {
		e.Err = err
		return e
	}
	return nil
}

func writeFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "writeFile",
		Path: path,
		Code: 500,
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		e.Err = err
		return e
	}

	// delete empty files
	if len(body) == 0 {
		err := rmFile(ROOT + path)
		if err != nil {
			e.Err = err
			return e
		}
		return nil
	}

	body = removeMultipleNewLines(body)
	body = addNewLine(body)

	err = ioutil.WriteFile(ROOT+path, body, 0664)
	if err != nil {
		e.Err = err
		return e
	}

	log.Printf("writeFile:\n{%s}\n", body)

	return nil
}

func viewFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api"):]

	e := &Err{
		Func: "view",
		Path: path,
		Code: 500,
	}

	fi, err := os.Stat(ROOT + path)
	if err != nil {
		e.Err = fmt.Errorf("Not found %v", path)
		e.Code = 404
		return e
	}

	v := &View{
		File: &File{
			Path: path,
			Type: getFileType(path, fi.IsDir()),
		},
		Parent: filepath.Dir(path),
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

	e := &Err{
		Func: "serveStatic",
		Path: path,
		Code: 500,
	}

	if fileType(path) == "text" {
		b, err := ioutil.ReadFile(ROOT + path)
		if err != nil {
			if filepath.Ext(path) == ".info" {
				// dummy requests arrive, because of attached info field
				return nil
			}
			e.Err = err
			return e
		}

		fmt.Fprintf(w, "%s", removeNewLine(b))
		return nil
	}

	http.ServeFile(w, r, ROOT+path)

	return nil
}
