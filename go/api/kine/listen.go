package kine

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"

	"g.rg-s.com/org/go/helper/reqerr"
	"g.rg-s.com/org/go/index"
)

/*
	nginx has to listen with the following settings:

	proxy_http_version 1.1;
	expires off;
	proxy_buffering off;
	chunked_transfer_encoding on;
*/

func Listen(ix *index.Index, w http.ResponseWriter, r *http.Request) *reqerr.Err {
	b := bufio.NewReader(r.Body)
	for {
		line, err := b.ReadSlice('x')
		if err != nil {
			if err != io.ErrUnexpectedEOF {
				log.Println(err)
			}
			break
		}
		time, speed := findValues(string(line))
		percent := time / ix.Processing.Duration * 100
		ix.Status <- fmt.Sprintf(
			"%v/%v %vp %.1f%% %vx",
			ix.Processing.Step,
			ix.Processing.Steps,
			ix.Processing.Size,
			percent,
			speed,
		)
	}
	ix.Status <- "ENDED"
	return nil
}

func findValues(str string) (float64, string) {
	ts, end := extractValue(str, "out_time=", "00:00:30.28000")
	speed, _ := extractValue(str[end:], "speed=", "7.40x")

	// remove the x and add again later in case of double digit before period:
	// 15.x instead of 7.x
	if l := len(speed); speed[l-1] == 'x' {
		speed = speed[:l-1]
	}
	return parseTimestamp(ts), speed
}

func extractValue(raw, needle, tmpl string) (value string, end int) {
	i := strings.Index(raw, needle)
	start := i + len(needle)
	end = start + len(tmpl)
	if i < 0 || end > len(raw) {
		return "", 0
	}
	return raw[start:end], end
}

func parseTimestamp(ts string) float64 {
	if ts[:3] == "N/A" {
		return 0
	}
	hours := ts[:2]
	minutes := ts[3:5]
	seconds := ts[6:8]

	var duration float64
	for i, str := range []string{seconds, minutes, hours} {
		t, err := strconv.Atoi(str)
		if err != nil {
			log.Println(ts)
			log.Println(err)
			return 0
		}
		duration += float64(t) * math.Pow(60, float64(i))
	}
	return duration
}
