import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { basename } from 'path';
import TextareaAutosize from 'react-textarea-autosize';

const File = ({ file }) => {
  switch (file.type) {
    case "dir":
      return Dir({file})
    case "text":
      return Text({file})
    default:
      return Dir({file})
  }
}

const Text = ({file}) => {
  const [body, setBody] = useState("");

  useEffect(() => {
    fetch("/api" + file.path).then(
      resp => resp.text().then(
        textContent => setBody(textContent)
      )
    );
  }, [file]);

  const handleTyping = event => {
    setBody(event.target.value);
  }

  const submit = event => {
    fetch("/api" + file.path, {
      method: "POST",
      body:   body
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <>
      <Dir file={file} />
      <TextareaAutosize value={body}
      onChange={handleTyping}
      onBlur={submit} />
      </>
  )
}

const Dir = ({file}) => {
  return (
    <>
      <div>- <Link to={file.path}>{basename(file.path)}</Link> ({file.type})</div>
    </>
  )
}

const Files = () => {
  const [files, setFiles] = useState([]);

  const path = useLocation().pathname;
  useEffect(() => {
    fetch("/api" + path).then(
      resp => resp.json().then(
        files => setFiles(files)
      ));

  }, [path]);

  return (
    files.map((file, i) => (
      <File key={i} file={file} />
    ))
  );
}

export default Files;


