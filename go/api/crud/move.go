package crud

import (
	"io"
	"net/http"
	"os"

	"g.rg-s.com/org/go/helper/file"
	"g.rg-s.com/org/go/helper/path"
	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

func RenameFile(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	p := ix.NewPath(r.URL.Path[len("/api/move"):])

	e := &reqerr.Err{
		Func: "RenameFile",
		Path: p.Rel,
	}

	newPath, err := getBodyPath(r)
	if err != nil {
		return e.Set(err, 500)
	}

	newP := p.New(newPath)

	// TODO: dont like that.
	err = createBot(newP)
	if err != nil {
		return e.Set(err, 500)
	}

	err = file.RenameSortEntry(p, newP)
	if err != nil {
		return e.Set(err, 500)
	}

	err = os.Rename(p.Abs(), newP.Abs())
	if err != nil {
		return e.Set(err, 500)
	}

	return nil
}

/*
func deleteBot(path string) error {
	dir := filepath.Dir(path)
	if filepath.Base(dir) != "bot" {
		return nil
	}

	l, err := os.ReadDir(dir)
	if err != nil {
		return err
	}

	if len(l) == 0 {
		return os.Remove(dir)
	}

	return nil
}
*/

func createBot(path *path.Path) error {
	dir := path.Parent()
	if dir.Base() != "bot" {
		return nil
	}

	_, err := os.Stat(dir.Abs())
	if err == nil {
		return nil
	}

	return os.Mkdir(dir.Abs(), 0755)
}

func getBodyPath(r *http.Request) (string, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return "", err
	}

	// TODO: make sure it’s a valid path
	p := string(body)

	return p, nil
}
