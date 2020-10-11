package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	p "path/filepath"
	"strings"
)

func writeSort(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/info"):]

	e := &Err{
		Func: "writeInfo",
		Path: path,
		Code: 500,
	}

	list := []string{}

	err := json.NewDecoder(io.Reader(r.Body)).Decode(&list)
	if err != nil {
		e.Err = err
		return e
	}

	sorted := makeFiles(path, list)

	files, err := readFiles(path)
	if err != nil {
		e.Err = err
		return e
	}

	all := separate(merge(sorted, files))

	err = writeSortFile(path, all)
	if err != nil {
		e.Err = err
		return e
	}

	println("written")

	return nil
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

	err = createBot(newPath)
	if err != nil {
		e.Err = err
		return e
	}
	
	err = renameSortEntry(path, newPath)
	if err != nil {
		e.Err = err
		return e
	}

	err = os.Rename(ROOT+path, ROOT+newPath)
	if err != nil {
		e.Err = err
		return e
	}

	/*
	err = deleteBot(oldPath)
	if err != nil {
		e.Err = err
		return e
	}
	*/

	return nil
}

func deleteBot(path string) error {
	dir := p.Dir(path)
	if p.Base(dir) != "bot" {
		return nil
	}

	l, err := ioutil.ReadDir(dir)
	if err != nil {
		return err
	}

	if len(l) == 0 {
		return os.Remove(dir)
	}

	return nil
}

func createBot(path string) error {

	dir := p.Dir(path)
	if p.Base(dir) != "bot" {
		return nil
	}

	_, err := os.Stat(dir)
	if err == nil {
		return nil
	}

	return os.Mkdir(dir, 0755)
}

func getRenamePath(r *http.Request) (string, error) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return "", err
	}

	// TODO: make sure it’s a valid path

	path := string(body)

	println("renamePath", path);

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

	if strings.Contains(path, ".") || p.Base(path) == "info" {
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

	fi, err := os.Stat(ROOT + p.Dir(path))
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

	// delete empty info files
	if p.Ext(path) == ".info" && len(body) == 0 {
		err := rmFile(ROOT + path)
		if err != nil {
			e.Err = err
			return e
		}
		return nil
	}

	// handle newfile command
	if bytes.Equal(body, []byte("newfile")) {
		body = []byte{}
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


