package file

import (
	"bytes"
)

const newLine = '\n'

func HasNewLine(b []byte) bool {
	l := len(b)
	return l > 0 && b[l-1] == newLine
}

func RemoveNewLine(b []byte) []byte {
	if HasNewLine(b) {
		return b[:len(b)-1]
	}
	return b
}

func AddNewLine(b []byte) []byte {
	if !HasNewLine(b) {
		return append(b, newLine)
	}
	return b
}

func RemoveMultipleNewLines(b []byte) []byte {
	return bytes.ReplaceAll(b, []byte("\n\n\n"), []byte("\n\n"))
}
