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

func (e *Err) Create() error {
	return fmt.Errorf("%v: %w (%d) (%v)", e.Func, e.Err, e.Code, e.Path)
}

func (e *Err) Error() string {
	return e.Create().Error()
}

func (e *Err) Unwrap() error {
	return e.Err
}

func (e *Err) Set(err error, code int) *Err {
	e.Code = code
	e.Err = err
	return e
}
