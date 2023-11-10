package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func writeSort(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/sort"):]

	e := &Err{
		Func: "writeSort",
		Path: path,
		Code: 500,
	}

	list := []string{}

	err := json.NewDecoder(io.Reader(r.Body)).Decode(&list)
	if err != nil {
		e.Err = err
		return e
	}

	/*

		sorted, err := makeFiles(path, list)

		files, err := readFiles(path)
		if err != nil {
			e.Err = err
			return e
		}

		all := separate(merge(sorted, files))
	*/

	err = writeSortFile(path, list)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func copyFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/copy"):]

	e := &Err{
		Func: "copyFile",
		Path: path,
		Code: 500,
	}

	newPath, err := getBodyPath(r)
	if err != nil {
		e.Err = err
		return e
	}

	if strings.Contains(newPath, "/public/") {
		dir := filepath.Dir(newPath)
		err := os.MkdirAll(ROOT+dir, 0755)
		if err != nil {
			e.Err = err
			return e
		}
		err = createInfo(dir)
		if err != nil {
			return e
		}
	}

	err = copyFileFunc(path, newPath)
	if err != nil {
		e.Err = fmt.Errorf("Faulty target path: %v", newPath)
		return e
	}

	return nil
}

func copyFileFunc(oldpath, newpath string) error {
	b, err := os.ReadFile(ROOT + oldpath)
	if err != nil {
		return err
	}

	return os.WriteFile(ROOT+newpath, b, 0644)
}

func renameFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/move"):]

	e := &Err{
		Func: "renameFile",
		Path: path,
		Code: 500,
	}

	newPath, err := getBodyPath(r)
	if err != nil {
		e.Err = err
		return e
	}

	// dont like that.
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
	dir := filepath.Dir(path)
	if filepath.Base(dir) != "bot" {
		return nil
	}

	l, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	if len(l) == 0 {
		return os.Remove(dir)
	}

	return nil
}

func createBot(path string) error {
	dir := ROOT + filepath.Dir(path)
	if filepath.Base(dir) != "bot" {
		return nil
	}

	_, err := os.Stat(dir)
	if err == nil {
		return nil
	}

	return os.Mkdir(dir, 0755)
}

func getBodyPath(r *http.Request) (string, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}

	// TODO: make sure it’s a valid path

	path := string(body)

	return path, nil
}

func deleteFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/delete"):]

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
	path := r.URL.Path[len("/api/write"):]

	if strings.Contains(path, ".") || filepath.Base(path) == "info" {
		return writeFile(w, r)
	}
	return createDir(w, r)
}

func createDir(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/write"):]

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

	err = createInfo(path)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func createInfo(path string) error {
	name := filepath.Base(path)
	if name == "bot" || !strings.Contains(path, "/public") {
		return nil
	}

	return os.WriteFile(ROOT+path+"/info", []byte(getInfoText(path)), 0755)
}

func getInfoText(path string) string {
	title := ""
	date := time.Time{}

	t, err := parsePathDate(path)
	if err != nil {
		date = time.Now()
		title = strings.Title(filepath.Base(path))
	} else {
		date = t
	}

	text := ""

	if title != "" {
		text = fmt.Sprintf("title: %v\n", title)
	}

	return fmt.Sprintf("%vdate: %v\n", text, date.Format("060102_150405"))
}

func getDirDate(path string) time.Time {
	t, err := parsePathDate(path)
	if err != nil {
		return time.Now()
	}
	return t
}

func parsePathDate(path string) (time.Time, error) {
	format := "/06/06-01/02"
	lenPath := len(path)
	lenFormat := len(format)
	if lenPath > lenFormat {
		t, err := time.Parse(format, path[lenPath-lenFormat:])
		if err != nil {
			return time.Time{}, err
		}
		// this is because years start on second 0, months on 1, days on 2)
		return t.Add(time.Second * 2), nil
	}
	return time.Time{}, fmt.Errorf("getDirDate: path too short")
}

func writeFile(w http.ResponseWriter, r *http.Request) *Err {
	path := r.URL.Path[len("/api/write"):]

	e := &Err{
		Func: "writeFile",
		Path: path,
		Code: 500,
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		e.Err = err
		return e
	}

	// delete empty info files
	if filepath.Ext(path) == ".info" && len(body) == 0 {
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

	err = checkTodayPath(path)
	if err != nil {
		e.Err = err
		return e
	}

	fpath := ROOT + path
	err = os.WriteFile(fpath, body, 0664)
	if err != nil {
		e.Err = err
		return e
	}
	IX.UpdateFile(fpath)

	// log.Printf("writeFile:\n{%s}\n", body)
	return nil
}

func checkTodayPath(path string) error {
	if today := todayPath(); filepath.Dir(path) == today {
		_, err := os.Stat(today)
		if err != nil {
			_, err = makeToday()
			if err != nil {
				return err
			}
		}
	}
	return nil
}
