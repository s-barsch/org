package today

import (
	"fmt"
	"net/http"
	"org/go/helper"
	"org/go/index"
	"os"
	fp "path/filepath"
	"time"
)

func GetToday(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	e := &helper.Err{
		Func: "getToday",
		Code: 500,
	}

	path, err := helper.MakeToday(ix.Root)
	if err != nil {
		e.Err = err
		return e
	}

	fmt.Fprint(w, path)
	return nil
}

func GetNow(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	e := &helper.Err{
		Func: "getNow",
		Code: 500,
	}

	now, err := makeNow(ix.Root)
	if err != nil {
		e.Err = err
		return e
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
