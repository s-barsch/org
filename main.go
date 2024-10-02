package main

import (
	"log"
	"net/http"

	"g.sacerb.com/org/go/index"
	"g.sacerb.com/org/go/routes"
)

func main() {
	ix := index.New("dist", "data")
	go ix.Load()

	http.Handle("/", routes.Routes(ix))
	log.Fatal(http.ListenAndServe(":8334", nil))
}
