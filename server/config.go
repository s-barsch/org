package main

import (
	"io"
	"os"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Links []string
}

func loadConfig() (*Config, error) {
	f, err := os.Open("./config.yaml")
	if err != nil {
		return nil, err
	}

	c := &Config{}

	d := yaml.NewDecoder(io.Reader(f))
	err = d.Decode(&c)
	if err != nil {
		return nil, err
	}

	return c, nil
}
