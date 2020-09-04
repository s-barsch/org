import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Text from './text';
import Info from './info';

const File = ({ file }) => {
  switch (file.type) {
    case "dir":
      return Info({file})
    case "text":
      return Text({file})
    default:
      return Info({file})
  }
}

const DirView = () => {
  const [files, setFiles] = useState([]);

  const path = useLocation().pathname;
  useEffect(() => {
    fetch("/api" + path).then(
      resp => resp.json().then(
        files => setFiles(files)
      ));

  }, [path]);


  return (
    <>
      <DirList  dirs={dirsOnly(files)} />
      <FileList files={filesOnly(files)} />
    </>
  )
}

const DirList = ({dirs}) => {
  return (
    dirs.map((dir, i) => (
      <Dir key={i} dir={dir} />
    ))
  )
}

const Dir = ({dir}) => {
  return (
    <Link to={dir.path}>{dir.path}</Link>
  )
}

const FileList = ({files}) => {
  return (
    files.map((file, i) => (
      <File key={i} file={file} />
    ))
  );
}

export default DirView;

const dirsOnly = (list) => {
  return list.filter((file) => {
    return file.type === "dir"
  })
}

const filesOnly = (list) => {
  return list.filter((file) => {
    return file.type !== "dir"
  })
}

/*
const NewDir = () => {
  const [name, setName] = useState("");
  const change = event => {
    setName(event.target.value);
  }
  const submit = event => {
  }
  return (
    <input type="text" onChange={change} onBlur={submit} />
  )
}


*/
