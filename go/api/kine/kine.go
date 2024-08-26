package kine

import (
	"fmt"
	"log"
	"net/http"
	"org/go/helper"
	"org/go/index"
	"os"
	fp "path/filepath"

	"g.sacerb.com/sacer/go/entry/info"
	"g.sacerb.com/sacer/go/entry/tools"
)

func Kines(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	list, err := readKines(0, "./data/public/kine")
	if err != nil {
		log.Println(err)
	}
	fmt.Fprint(w, list)
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
			kines = append(kines, t.Format("2006-01-02"))
		}
	}
	return kines, nil
}
