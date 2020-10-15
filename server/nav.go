package main

import (
	"strings"
)

type Nav struct {
	Items    []*Link `json:"items"`
	Siblings []*Link `json:"siblings"`
}

type Link struct {
	Name string `json:"name"`
	Href string `json:"href"`
	Active bool `json:"active"`
}

func getNav(path string) (*Nav, error) {
	sibs := []*Link{}
	
	if strings.Count(path, "/") >= 4 {
		siblings, err := getSiblings(path)
		if err != nil {
			return nil, err
		}
		for _, f := range siblings {
			sibs = append(sibs, &Link{
				Name: f.Name,
				Href: f.Path,
				Active: f.Path == path,
			})
		}
		println("yes")
	}

	return &Nav{
		Siblings: sibs,
		Items: getCrumbs(path, getSwitchPath(path)),
	}, nil
}

func getCrumbs(path, switchPath string) []*Link{
	items := []*Link{
		&Link{
			Href: "/",
			Name: "org",
		},
	}
	if path == "/" {
		return items
	}
	href := ""
	for _, name := range strings.Split(path[1:], "/") {
		href += "/" + name
		ihref := href
		if name == "public" || name == "private" {
			ihref = switchPath
		}
		items = append(items, &Link{
			Href: ihref,
			Name: name,
		})
	}
	return items
}


