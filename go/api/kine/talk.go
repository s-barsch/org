package kine

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"g.sacerb.com/imagecache/cache"
	"g.sacerb.com/org/go/helper"
	"g.sacerb.com/org/go/index"
	"github.com/gorilla/websocket"
)

// only used locally anyway
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Command struct {
	Action string `json:"action"`
	Url    string `json:"url"`
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

	m := Command{}
	defer c.Close()
	for {
		err := c.ReadJSON(&m)
		if err != nil {
			log.Println("read:", err)
			break
		}
		switch m.Action {
		case "RECACHE":
			err = recacheFiles(ix, m.Url)
			if err != nil {
				log.Println(err)
			}
			ix.Status <- "ENDED"
		case "STOP":
			err = c.WriteMessage(websocket.TextMessage, []byte("aborted"))
			if err != nil {
				log.Println(err)
			}
			ix.Abort <- true
		default:
			fmt.Println(m)
		}
		/*
			_, b, err := c.ReadMessage()
			if err != nil {
				log.Println(err)
			}
			println("here")
			println(string(b))
		*/
	}
	if h.Err != nil {
		return h
	}
	return nil
}

func recacheFiles(ix *index.Index, url string) error {
	if strings.Contains(url, "public") {
		path := ix.NewPath(url)
		return cache.CacheImages(path.Abs(), &cache.Options{Writer: newWriter(ix)})
	}
	ix.Status <- "not allowed"
	<-time.After(1 * time.Second)
	return nil
}
