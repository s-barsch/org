package main

import (
	"net/http"

	"g.sacerb.com/org/go/index"
	"g.sacerb.com/org/go/routes"
)

func main() {
	ix := index.New("dist", "data")
	go ix.Load()

	http.Handle("/", routes.Routes(ix))
	http.ListenAndServe(":8334", nil)
}
