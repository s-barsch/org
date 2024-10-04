package kine

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	fp "path/filepath"
	"time"

	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"

	"g.rg-s.com/sera/go/entry/info"
	"g.rg-s.com/sera/go/entry/tools"
)

const datestr = "2006-01-02"
const kineRoot = "./data/public/kine"

const (
	CreateAPI = "/api/kine/create"
	UploadAPI = "/api/kine/upload"
	TalkAPI   = "/api/kine/talk"
)

func Create(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	path, err := createKine(r)
	if err != nil {
		return &reqerr.Err{
			Func: "kine.Create",
			Path: "/api/kines",
		}
	}
	fmt.Fprint(w, path)
	return nil
}

func createKine(r *http.Request) (string, error) {
	b, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}
	t, err := time.Parse(datestr, string(b))
	if err != nil {
		return "", err
	}
	d, err := time.ParseDuration("2s")
	if err != nil {
		return "", err
	}
	t = t.Add(d)
	path := t.Format("06/06-01/02")
	fsPath := fp.Join(kineRoot, path)
	webPath := fp.Join("/public/kine", path)

	_, err = os.Stat(fsPath)
	if err == nil {
		return webPath, nil
	}
	err = os.MkdirAll(fsPath, 0755)
	if err != nil {
		return "", err
	}
	infoContent := fmt.Sprintf("date: %v\ntitle: \ntitle-en: \n", t.Format(tools.Timestamp))
	err = os.WriteFile(fp.Join(fsPath, "info"), []byte(infoContent), 0755)
	if err != nil {
		return "", err
	}
	return webPath, nil
}

func Kines(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	list, err := readKines(0, kineRoot)
	if err != nil {
		log.Println(err)
	}
	err = json.NewEncoder(w).Encode(list)
	if err != nil {
		return &reqerr.Err{
			Func: "kine.Kines",
			Path: "/api/kines",
		}
	}
	return nil
}

func readKines(level int, path string) ([]string, error) {
	level++
	l, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}
	kines := []string{}
	for _, f := range l {
		if !f.IsDir() || tools.IsNameSys(f.Name()) {
			continue
		}
		p := fp.Join(path, f.Name())
		list, err := readKines(level, p)
		if err != nil {
			return nil, err
		}
		kines = append(kines, list...)
		if level == 3 {
			i, err := info.ReadDirInfo(p)
			if err != nil {
				return nil, err
			}
			t, err := tools.ParseTimestamp(i["date"])
			if err != nil {
				return nil, err
			}
			kines = append(kines, t.Format(datestr))
		}
	}
	return kines, nil
}
