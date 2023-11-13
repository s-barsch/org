package sort

import (
	"encoding/json"
	"io"
	"net/http"
	"org/go/helper"
	"org/go/helper/file"
	"org/go/index"
)

func WriteSort(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	path := ix.NewPath(r.URL.Path[len("/api/sort"):])

	e := &helper.Err{
		Func: "writeSort",
		Path: path.Rel,
		Code: 500,
	}

	list := []string{}

	err := json.NewDecoder(io.Reader(r.Body)).Decode(&list)
	if err != nil {
		e.Err = err
		return e
	}

	err = file.WriteSortFile(path, list)
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}
