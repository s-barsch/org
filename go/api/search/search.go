package search

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/index"
)

type Month struct {
	Key   string `json:"key"`
	Year  string `json:"year"`
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type ResultView struct {
	Name   string       `json:"name"`
	Months []*Month     `json:"months"`
	Files  []*file.File `json:"files"`
}

func SearchFiles(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	query := r.URL.Path[len("/api/search"):]

	e := &helper.Err{
		Func: "search.SearchFiles",
		Path: query,
	}

	files := []*file.File{}
	matches := ix.Words.Search(query)

	months := map[string]int{}

	for i, f := range matches {
		months[monthName(f.Name())]++
		files = append(files, &file.File{
			Num:  i,
			Path: f.Path,
			Name: f.Name(),
			Type: "text",
			Body: f.String(),
		})
	}

	v := &ResultView{
		Name:   query,
		Months: makeMonths(months),
		Files:  files,
	}

	err := json.NewEncoder(w).Encode(v)
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}

func monthName(str string) string {
	if len(str) < 5 {
		return "9999"
	}
	month := str[:4]
	_, err := strconv.Atoi(month)
	if err != nil {
		month = "9999"
	}
	return month
}

type Asc []*Month

func (a Asc) Len() int           { return len(a) }
func (a Asc) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a Asc) Less(i, j int) bool { return a[i].Name < a[j].Name }

func key(t time.Time) string {
	return t.Format("0601")
}

func makeMonths(m map[string]int) []*Month {
	min, _, err := minMaxTime(m)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	max := time.Now()
	months := []*Month{}
	for {
		k := key(min)
		months = append(months, &Month{Key: k, Count: m[k]})
		min = min.AddDate(0, 1, 0)
		if key(min) > key(max) {
			break
		}
	}
	return months
}

func minMaxTime(m map[string]int) (time.Time, time.Time, error) {
	min, max := minMax(m)
	t0, err := time.Parse("0601", min)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("minMaxTime: Could not parse %v", min)
	}
	t1, err := time.Parse("0601", max)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("minMaxTime: Could not parse %v", max)
	}
	return t0, t1, nil
}

func minMax(m map[string]int) (string, string) {
	mstr := []string{}
	for k := range m {
		if k == "9999" {
			continue
		}
		mstr = append(mstr, k)
	}
	sort.Strings(mstr)
	if len(mstr) == 0 {
		return "", ""
	}
	min := mstr[0]
	if len(mstr) < 2 {
		return min, min
	}
	return min, mstr[len(mstr)-1]
}
