package crud

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"org/go/helper"
	"org/go/helper/file"
	"org/go/helper/path"
	"org/go/index"
	"os"
	"path/filepath"
	"strings"
	"time"
)

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

func rmFile(path string) error {
	_, err := os.Stat(path)
	if err != nil {
		return nil
	}
	return os.Remove(path)
}
