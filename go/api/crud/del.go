package crud

import (
	"net/http"
	"os"
	fp "path/filepath"

	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func DeleteFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	path := r.URL.Path[len("/api/delete"):]

	e := &reqerr.Err{
		Func: "DeleteFile",
		Path: path,
	}

	err := os.Remove(fp.Join(ix.Root, path))
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}
