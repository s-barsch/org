module g.rg-s.com/org

go 1.23.0

require (
	g.rg-s.com/imagecache v0.0.0-20240830123746-4fcf4107b8a3
	g.rg-s.com/sera v0.0.0-20241004175708-3ecda7393035
	github.com/antonbaumann/german-go-stemmer v1.2.0
	github.com/gorilla/mux v1.8.1
	github.com/gorilla/websocket v1.5.3
	golang.org/x/text v0.19.0
	gopkg.in/vansante/go-ffprobe.v2 v2.2.0
)

require (
	github.com/kennygrant/sanitize v1.2.4 // indirect
	github.com/rwcarlsen/goexif v0.0.0-20190401172101-9e8deecbddbd // indirect
	github.com/yuin/goldmark v1.7.4 // indirect
	golang.org/x/net v0.30.0 // indirect
	gopkg.in/gographics/imagick.v2 v2.7.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace g.rg-s.com/imagecache => ../imagecache
