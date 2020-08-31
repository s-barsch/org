import React, {useState, useEffect} from 'react';
import './App.css';
import { basename } from 'path';

const File = ({ file }) => {
  console.log("x");
  return (
    <>
      <div>- <a href={file.path}>{basename(file.path)}</a> ({file.type})</div>
    </>
  )
}

const App = () => {
  const [files, setFiles] = useState([]);

  const path = window.location.pathname;

  useEffect(() => {
    fetch("/api/view" + path).then(
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

export default App;
