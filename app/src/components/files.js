import React, { useEffect, useState } from 'react';

const Files = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {

    fetch("/api/view/").then(
      resp => resp.json().then(
        files => setFiles(files)
      ));

  }, []);

  return (
    files.map((file, i) => ({
      if
      <File key={i} file={file} />
    }))
  );
}

const File = ({ file }) => {
  console.log("x");
  return (
    <div>{file.path}</div>
  )
}

export default Files;

