package reqerr

import "fmt"

type Err struct {
	Func string
	Path string
	Code int
	Err  error
}

func New(fnName, path string) *Err {
	return &Err{
		Func: fnName,
		Path: path,
		Code: 500,
	}
}

func (e *Err) Error() string {
	return fmt.Sprintf("%v: %v (%d) (%v)", e.Func, e.Err.Error(), e.Code, e.Path)
}

func (e *Err) Set(err error, code int) *Err {
	e.Code = code
	e.Err = err
	return e
}
