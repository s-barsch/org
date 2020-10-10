import React, { useEffect, useState } from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import Text from './text';
import Info from './info';
import Image from './image';
import {basename} from 'path';
import AddDir from './add-dir';
import NewTimestamp from '../funcs/date';
import { ReactSortable } from "react-sortablejs";


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

const FileSwitch = ({file, moveFn, delFn, single}) => {
  switch (file.type) {
    case "text":
      return <Text file={file} moveFn={moveFn} delFn={delFn} single={single} />
    case "image":
      return <Image file={file} moveFn={moveFn} delFn={delFn} />
    default:
      return <Info file={file} moveFn={moveFn} delFn={delFn} />
  }
}

const DirListing = () => {
  const [files, setFiles] = useState([]);

  const path = useLocation().pathname;
  const history = useHistory();


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

  const newFile = () => {
    const newPath = path + "/" + NewTimestamp() + ".txt";
    fetch("/api" + newPath, {
      method: "POST",
      body: "newfile"
    }).then(
      history.push(newPath)
    ).catch((error) => {
      console.error('Error:', error);
    });
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={newFile} />
        <FileList files={filesOnly(files)} moveFn={move} delFn={del} />
      </section>
    </>
  )
}

const AddText = ({newFn}) => {
  return <button onClick={newFn}>⁂</button>
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
  const [state, setState] = useState(files);

  useEffect(() => {
    setState(files);
  }, [files])
  
  const callOnEnd = () => {
    for (const f of state) {
      console.log(f.id);
    }
    console.log("-");
  };

  return (
    <ReactSortable delay={10}
    onEnd={callOnEnd}
    animation={200} list={state} setList={setState}>
    { state.map((file, i) => (
      <FileEntry key={file.id} file={file} moveFn={moveFn} delFn={delFn} />
    ))}
    </ReactSortable>
  );
}

export { DirListing, FileSwitch };

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
