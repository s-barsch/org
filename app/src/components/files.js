import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Text from './text';
import Info from './info';
import {basename} from 'path';
import AddDir from './add-dir';

const File = ({ file }) => {
  const drag = (ev) => {
    ev.dataTransfer.setData("text", file.path);
  }

  return (
    <div draggable="true" onDragStart={drag}>
      <FileSwitch file={file} />
    </div>
  )
}

const FileSwitch = ({file}) => {
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

  const loadFiles = (path) => {
    fetch("/api" + path).then(
      resp => resp.json().then(
        files => setFiles(files)
      ));
  }

  const path = useLocation().pathname;

  useEffect(() => {
    loadFiles(path);
  }, [path]);

  const addNewDir = (name) => {
    fetch("/api" + path + "/" + name, {
      method: "POST"
    }).then(
      loadFiles(path)
    ).catch(err => {
      alert(err);
      console.log(err);
    })
  }

  return (
    <section>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <FileList files={filesOnly(files)} />
    </section>
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
    <Link to={dir.path}>{basename(dir.path)}</Link>
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
