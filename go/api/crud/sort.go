package crud

import (
	"encoding/json"
	"io"
	"net/http"

	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func WriteSort(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	path := ix.NewPath(r.URL.Path[len("/api/sort"):])

	e := reqerr.New("WriteSort", path.Rel)

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
