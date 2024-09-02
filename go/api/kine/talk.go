package kine

import (
	"log"
	"net/http"

	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/index"
	"github.com/gorilla/websocket"
)

// only used locally anyway
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func Talk(ix *index.Index, w http.ResponseWriter, r *http.Request) *helper.Err {
	h := &helper.Err{
		Func: "kine.Talk",
		Path: TalkAPI,
		Code: 500,
	}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil
	}
	defer ix.ResetStatus()
	log.SetFlags(log.Lmicroseconds)
	go func() {
		for msg := range ix.Status {
			err = c.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				log.Println("goroutine")
				log.Println(err)
				h.Err = err
			}
		}
	}()

	defer c.Close()
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		if string(message) == "STOP" {
			err = c.WriteMessage(websocket.TextMessage, []byte("aborted"))
			if err != nil {
				h.Err = err
				return h
			}
			ix.Abort <- true
		}
		log.Println(string(message))
	}
	if h.Err != nil {
		return h
	}
	return nil
}
