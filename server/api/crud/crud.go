package crud

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"org/server/helper"
	"org/server/helper/file"
	"org/server/helper/path"
	"org/server/index"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func CopyFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/copy"):])

	e := &helper.Err{
		Func: "copyFile",
		Path: p.Rel,
		Code: 500,
	}

	newPath, err := getBodyPath(r)
	if err != nil {
		e.Err = err
		return e
	}

	if strings.Contains(newPath.Rel, "/public/") {
		dir := &path.Path{Rel: filepath.Dir(newPath.Abs())}
		err := os.MkdirAll(dir.Abs(), 0755)
		if err != nil {
			e.Err = err
			return e
		}
		err = createInfo(dir)
		if err != nil {
			return e
		}
	}

	err = copyFileFunc(p, newPath)
	if err != nil {
		e.Err = fmt.Errorf("Faulty target path: %v", newPath)
		return e
	}

	return nil
}

func copyFileFunc(oldpath, newpath *path.Path) error {
	b, err := os.ReadFile(oldpath.Abs())
	if err != nil {
		return err
	}

	return os.WriteFile(newpath.Abs(), b, 0644)
}

func RenameFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/move"):])

	e := &helper.Err{
		Func: "renameFile",
		Path: p.Rel,
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

	err = file.RenameSortEntry(p, newPath)
	if err != nil {
		e.Err = err
		return e
	}

	err = os.Rename(p.Abs(), newPath.Abs())
	if err != nil {
		e.Err = err
		return e
	}

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

func createBot(path *path.Path) error {
	dir := path.Parent()
	if dir.Base() != "bot" {
		return nil
	}

	_, err := os.Stat(dir.Abs())
	if err == nil {
		return nil
	}

	return os.Mkdir(dir.Abs(), 0755)
}

func getBodyPath(r *http.Request) (*path.Path, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, err
	}

	// TODO: make sure it’s a valid path
	p := string(body)

	return &path.Path{Rel: string(p)}, nil
}

func rmFile(path string) error {
	_, err := os.Stat(path)
	if err != nil {
		return nil
	}
	return os.Remove(path)
}
func CreateDir(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])

	e := &helper.Err{
		Func: "createDir",
		Path: p.Rel,
		Code: 500,
	}

	dir := p.Parent()
	fi, err := os.Stat(dir.Abs())
	if err != nil {
		e.Err = err
		return e
	}
	if !fi.IsDir() {
		e.Err = fmt.Errorf("Can’t create dir in non-dir.")
		return e
	}
	err = os.Mkdir(p.Abs(), 0755)
	if err != nil {
		e.Err = err
		return e
	}

	err = createInfo(p)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}

func createInfo(path *path.Path) error {
	if path.Base() == "bot" || !strings.Contains(path.Rel, "/public") {
		return nil
	}

	return os.WriteFile(path.Abs()+"/info", []byte(getInfoText(path.Rel)), 0755)
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

func WriteFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])

	e := &helper.Err{
		Func: "writeFile",
		Path: p.Rel,
		Code: 500,
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		e.Err = err
		return e
	}

	// delete empty info files
	if p.Ext() == ".info" && len(body) == 0 {
		err := rmFile(p.Abs())
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

	body = file.RemoveMultipleNewLines(body)
	body = file.AddNewLine(body)

	err = isTodayPath(p)
	if err != nil {
		e.Err = err
		return e
	}

	err = os.WriteFile(p.Abs(), body, 0664)
	if err != nil {
		e.Err = err
		return e
	}
	ix.UpdateFile(p.Rel)

	// log.Printf("writeFile:\n{%s}\n", body)
	return nil
}

func isTodayPath(p *path.Path) error {
	today := helper.TodayPath()
	dir := p.Parent()
	if dir.Rel == today {
		if !dir.Exists() {
			_, err := helper.MakeToday(p.Root)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func WriteSwitch(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	p := ix.NewPath(r.URL.Path[len("/api/write"):])

	if strings.Contains(p.Rel, ".") || p.Base() == "info" {
		return WriteFile(ix, w, r)
	}
	return CreateDir(ix, w, r)
}
