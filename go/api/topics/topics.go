package topics

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"time"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

type Topic struct {
	Name     string `json:"name"`
	Len      int    `json:"len"`
	LastDate int64  `json:"lastDate"`
}

type ByDate []*Topic

func (a ByDate) Len() int      { return len(a) }
func (a ByDate) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByDate) Less(i, j int) bool {
	return a[i].LastDate > a[j].LastDate
}

func lastDate(files []*index.File) (time.Time, error) {
	for _, f := range files {
		format := "060102_150405"
		name := f.Name()
		if len(name) < len(format) {
			continue
		}
		t, err := time.Parse(format, name[:len(format)])
		if err != nil {
			continue
		}
		return t, nil
	}
	return time.Time{}, fmt.Errorf("no valid date found")
}

func Topics(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	e := reqerr.New("topics.Topics", "")

	topics := []*Topic{}
	for t := range ix.Tags {
		date, err := lastDate(ix.Tags[t])
		if err != nil {
			log.Println(err)
		}
		topics = append(topics, &Topic{
			Name:     t,
			Len:      len(ix.Tags[t]),
			LastDate: date.Unix(),
		})
	}

	sort.Sort(ByDate(topics))

	err := json.NewEncoder(w).Encode(topics)
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}

func ViewTopic(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	topic := r.URL.Path[len("/api/topics/"):]
	indexed := ix.Tags[topic]

	e := reqerr.New("topics.ViewTopic", topic)

	files := []*file.File{}
	for i, f := range indexed {
		files = append(files, &file.File{
			Num:  i,
			Path: f.Path,
			Name: f.Name(),
			Type: "text",
			Body: f.String(),
		})
	}

	v := &helper.DirView{
		Path: topic,
		// Nav:  nav,
		Dir: &helper.Dir{
			Files:  files,
			Sorted: false,
		},
	}

	err := json.NewEncoder(w).Encode(v)
	if err != nil {
		return e.Set(err, 500)
	}
	return nil
}
