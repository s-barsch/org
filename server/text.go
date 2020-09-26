package main

import (
	"bytes"
)

const newLine = '\n'

func hasNewLine(b []byte) bool {
	l := len(b)
	return l > 0 && b[l-1] == newLine
}

func removeNewLine(b []byte) []byte {
	if hasNewLine(b) {
		return b[:len(b)-1]
	}
	return b
}

func addNewLine(b []byte) []byte {
	if !hasNewLine(b) {
		return append(b, newLine)
	}
	return b
}

func removeMultipleNewLines(b []byte) []byte {
	return bytes.ReplaceAll(b, []byte("\n\n\n"), []byte("\n\n"))
}
