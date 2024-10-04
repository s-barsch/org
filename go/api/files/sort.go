package files

import (
	"encoding/json"
	"io"
	"net/http"

	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func WriteSort(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/sort"):])
	e := reqerr.New("WriteSort", p.Path)

	list := []string{}

	err := json.NewDecoder(io.Reader(r.Body)).Decode(&list)
	if err != nil {
		return e.Set(err, 500)
	}

	err = file.WriteSortFile(p, list)
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}
