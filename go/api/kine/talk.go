package kine

import (
	"fmt"
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
	ix.Status = make(chan string, 100)
	defer close(ix.Status)
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil
	}
	go func() {
		for msg := range ix.Status {
			err = c.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				fmt.Println(err)
				h.Err = err
			}
		}
	}()
	defer c.Close()
	for {
		select {
		case msg := <-ix.Status:
			err = c.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				h.Err = err
				return h
			}
		default:
		}
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
