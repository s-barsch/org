package crud

import (
	"net/http"
	"os"
	fp "path/filepath"

	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/index"
)

func DeleteFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	path := r.URL.Path[len("/api/delete"):]

	e := &helper.Err{
		Func: "deleteFile",
		Path: path,
		Code: 500,
	}

	err := os.Remove(fp.Join(ix.Root, path))
	if err != nil {
		e.Err = err
		return e
	}

	return nil
}
