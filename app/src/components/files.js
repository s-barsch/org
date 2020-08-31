import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { basename } from 'path';

const File = ({ file }) => {
  return (
    <>
      <div>- <Link to={file.path}>{basename(file.path)}</Link> ({file.type})</div>
    </>
  )
}

const Files = ({winPath}) => {
  const [files, setFiles] = useState([]);

  let path = useLocation().pathname;
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

export default Files;


