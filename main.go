package main

import (
	"log"
	"net/http"

	"g.rg-s.com/org/go/index"
	"g.rg-s.com/org/go/routes"
)

func main() {
	ix := index.New("dist", "data")
	go ix.Load()

	http.Handle("/", routes.Routes(ix))
	log.Fatal(http.ListenAndServe(":8334", nil))
}
