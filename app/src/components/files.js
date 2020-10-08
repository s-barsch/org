import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Text from './text';
import Info from './info';
import Image from './image';
import {basename} from 'path';
import AddDir from './add-dir';

const FileEntry = ({ file, moveFn, delFn }) => {
  const drag = (ev) => {
    ev.dataTransfer.setData("text", file.path);
  }

  return (
    <div draggable="true" onDragStart={drag}>
      <FileSwitch file={file} moveFn={moveFn} delFn={delFn} />
    </div>
  )
}

const FileSwitch = ({file, moveFn, delFn}) => {
  switch (file.type) {
    case "text":
      return <Text file={file} moveFn={moveFn} delFn={delFn} />
    case "image":
      return <Image file={file} moveFn={moveFn} delFn={delFn} />
    default:
      return <Info file={file} moveFn={moveFn} delFn={delFn} />
  }
}

const DirListing = () => {
  const [files, setFiles] = useState([]);

  const path = useLocation().pathname;

  const loadFiles = (path) => {
    fetch("/api" + path + "?listing=true").then(
      resp => resp.json().then(
        files => setFiles(files)
      ));
  }

  useEffect(() => {
    loadFiles(path);
  }, [path]);

  const addNewDir = (name) => {
    if (name === "") {
      return;
    }
    if (path !== "/") {
      name = "/" + name
    }
    fetch("/api" + path + name, {
      method: "POST"
    }).then( resp => {
      if (!resp.ok) {
        alert(resp.statusText);
        return;
      }
      loadFiles(path)
    }
    ).catch(err => {
      alert(err);
      console.log(err);
    })
  }

  const move = (filepath, newPath) => {
    fetch("/api" + filepath, {
      method: "PUT",
      body: newPath
    }).then(
      loadFiles(path)
    ).catch(err => {
      alert(err);
      console.log(err);
    })
  }

  const del = filepath => {
    fetch("/api" + filepath, {
      method: "DELETE"
    }).then(
      loadFiles(path)
    ).catch(err => {
      alert(err);
      console.log(err);
    })
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <>hi!</>
        <FileList files={filesOnly(files)} moveFn={move} delFn={del} />
      </section>
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
    <Link to={dir.path}>{basename(dir.path)}</Link>
  )
}

const FileList = ({files, moveFn, delFn}) => {
  return (
    files.map((file, i) => (
      <FileEntry key={i} file={file} moveFn={moveFn} delFn={delFn} />
    ))
  );
}

export default DirListing;

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
