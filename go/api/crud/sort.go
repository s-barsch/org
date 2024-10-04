package crud

import (
	"encoding/json"
	"io"
	"net/http"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/index"
)

func WriteSort(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	path := ix.NewPath(r.URL.Path[len("/api/sort"):])

	e := &helper.Err{
		Func: "WriteSort",
		Path: path.Rel,
	}

	list := []string{}

	err := json.NewDecoder(io.Reader(r.Body)).Decode(&list)
	if err != nil {
		return e.Set(err, 500)
	}

	err = file.WriteSortFile(path, list)
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}
