import React, { useEffect, useState } from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import Text from './types/text';
import { Info } from './meta';
import Image from './types/image';
import {basename} from 'path';
import AddDir from './add-dir';
import NewTimestamp from '../funcs/date';
import { ReactSortable } from 'react-sortablejs';
import ReverseIcon from '@material-ui/icons/SwapVert';
import NewTextIcon from '@material-ui/icons/Flare';
//import * as p from '../funcs/paths';

const DirView = () => {
  const [files, setFiles] = useState([]);

  const path = useLocation().pathname;
  const history = useHistory();


  const loadFiles = (path) => {
    fetch("/api" + path + "?listing=true").then(
      resp => resp.json().then(
        files => setFiles(numerate(files))
      ));
  }

  useEffect(() => {
    loadFiles(path);
  }, [path]);

  const req = (path, options, callback) => {
    fetch("/api" + path, options).then( resp => {
      if (!resp.ok) {
        alert(resp.statusText);
        return;
      }
      callback();
    }
    ).catch(err => {
      alert(err);
    })
  }

  const addNewDir = (name) => {
    if (name === "") {
      return;
    }

    req(
      path + (path === "/" ? "" : "/") + name,
      { method: "POST" },
      () => { loadFiles(path) }
    )
  }

  const move = (filepath, newPath) => {
    req(
      filepath,
      { method: "PUT", body: newPath },
      () => { loadFiles(path) }
    )
  }

  const del = filepath => {
    req(
      filepath,
      { method: "DELETE" },
      () => { loadFiles(path) }
    )
  }

  const newFile = () => {
    const newPath = path + "/" + NewTimestamp() + ".txt";
    req(
      newPath,
      { method: "POST", body: "newfile" },
      () => { history.push(newPath) }
    )
  }

  const saveSorted = (part, type) => {
    let all = merge(files.slice(), part, type);

    /*
    if (p.IsPublic(path)) {
    }
    */
    fetch("/api/sort" + path, {
      method: "POST",
      body: JSON.stringify(makeArr(all))
    })

    setFiles(all);
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} saveFn={saveSorted} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={newFile} />
        <span className="right">
        </span>
        <FileList files={filesOnly(files)} saveFn={saveSorted} moveFn={move} delFn={del} />
      </section>
    </>
  )
}

const AddText = ({newFn}) => {
  return <button onClick={newFn}><NewTextIcon /></button>
}

const DirList = ({dirs, saveFn}) => {
  const [state, setState] = useState(dirs);

  useEffect(() => {
    setState(dirs);
  }, [dirs])

  const callOnEnd = () => {
    saveFn(state, "dirs");
  };

  return (
    <ReactSortable className="dirs__list" onEnd={callOnEnd}
    animation={200} list={state} setList={setState}>
    {state.map((dir) => (
      <Dir key={dir.id} dir={dir} />
    ))}
    </ReactSortable>
  )
}

const Dir = ({dir}) => {
  return (
    <Link to={dir.path}>{basename(dir.path)}</Link>
  )
}

const FileList = ({files, moveFn, delFn, saveFn}) => {
  const [state, setState] = useState(files);

  useEffect(() => {
    setState(files);
  }, [files])
  
  const reverseFiles = () => {
    const reverse = preSort(state.slice().reverse());
    saveFn(reverse, "files");
  }

  const callOnEnd = () => {
    saveFn(state, "files");
  };

  return (
    <>
      <span className="right">
        <button onClick={reverseFiles}><ReverseIcon /></button>
      </span>
      <ReactSortable 
      handle=".info__drag"
      onEnd={callOnEnd}
      animation={200} list={state} setList={setState}>
      { state.map((file) => (
        <FileEntry key={file.id} file={file} moveFn={moveFn} delFn={delFn} />
      ))}
      </ReactSortable>
    </>
  );
}

const FileEntry = ({ file, moveFn, delFn }) => {
  return (
    <FileSwitch file={file} moveFn={moveFn} delFn={delFn} />
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


export { DirView, FileSwitch };

const dirsOnly = (list) => {
  if (!list) {
    return [];
  }
  return list.filter((file) => {
    return file.type === "dir"
  })
}

const filesOnly = (list) => {
  if (!list) {
    return [];
  }
  return list.filter((file) => {
    return file.type !== "dir"
  })
}

const preSort = files => {
  let info = [];
  let sort = [];
  let nu   = [];

  for (const f of files) {
    if (f.name === "info") {
      info.push(f)
      continue
    }
    if (f.name === ".sort") {
      sort.push(f)
      continue
    }
    nu.push(f)
  }

  return info.concat(nu).concat(sort);
}

const numerate = files => {
  if (!files) {
    return [];
  }
  for (let i = 0; i < files.length; i++) {
    files[i].id = i
  }
  return files;
}

const makeArr = files => {
  let arr = [];
  for (const f of files) {
    arr.push(f.name);
  }
  return arr
}

const merge = (all, part, type) => {
  let diff = subtract(all, part)
  if (type === "files") {
    return diff.concat(part)
  } 
  return part.concat(diff)
}

const subtract = (base, other) => {
  for (const f of other) {
    for (let i = 0; i < base.length; i++) {
      if (base[i].name === f.name) {
        base.splice(i, 1)
        break;
      }
    }
  }
  return base
}


