package today

import (
	"fmt"
	"net/http"
	"os"
	fp "path/filepath"
	"time"

	"g.rg-s.com/org/go/helper"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func GetToday(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	e := &reqerr.Err{
		Func: "today.GetToday",
	}

	path, err := helper.MakeToday(ix.Root)
	if err != nil {
		return e.Set(err, 500)
	}

	fmt.Fprint(w, path)
	return nil
}

func GetNow(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	e := &reqerr.Err{
		Func: "today.GetNow",
	}

	now, err := makeNow(ix.Root)
	if err != nil {
		return e.Set(err, 500)
	}

	fmt.Fprint(w, now)
	return nil
}

func makeNow(root string) (string, error) {
	today, err := helper.MakeToday(root)
	if err != nil {
		return "", err
	}
	t := time.Now()
	path := fp.Join(today, t.Format("060102_150405.txt"))
	return path, os.WriteFile(fp.Join(root, path), []byte(""), 0644)
}
