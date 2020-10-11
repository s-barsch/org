import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import AddDir from './add';
import { NewTimeStamp } from '../../funcs/paths';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';
import { TargetsContext } from '../../targets';
import { basename } from 'path';

function DirView({view}) {
  const { setActiveTarget, activeTarget } = useContext(TargetsContext);

  const [path, setPath] = useState(view.file.path);

  useEffect(() => {
    setPath(view.file.path);
  }, [view]);

  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadFiles(path);
  }, [path]);

  const listenForWrite = useCallback(evt => {
    loadFiles(path);
  }, [path]);

  useEffect(() => {
    window.addEventListener('storage', listenForWrite);

    return () => {
      window.removeEventListener('storage', listenForWrite);
    };
  }, [listenForWrite]);


  async function loadFiles(path) {
    try {
      const resp = await fetch("/api" + path + "?listing=true");
      const arr  = await resp.json();
      setFiles(numerate(arr));
    } catch(err) {
      alert("loadFiles error. path: " + path + "\nerr: " + err);
    }

    let favicon = document.querySelector('link[rel="icon"]');
    favicon.href = "/blue.svg";

    setTimeout(() => {
      favicon.href = "/favicon.ico";
    }, 1)
  }

  const history = useHistory();

  async function request(path, options, callback) {
    try {
      const resp = await fetch("/api" + path, options);
      if (!resp.ok) {
        const text = await resp.text();
        alert("fetch failed: /api" + path + "\nreason: " + text);
        return;
      }
      callback();
    } catch(err) {
      console.log(err)
    }
  }

  const addNewDir = async (name) => {
    if (name === "") {
      return;
    }

    const newPath = path + (path === "/" ? "" : "/") + name;
    request(newPath, {
      method: "POST"
    },
      function callBack() {
        loadFiles(path);
      }
    )
  }

  const setWriteTime = () => {
    localStorage.setItem("write", Date.now())
  }
  const copyFile = (filepath, newPath) => {
    request(filepath, {
      method: "PATCH",
      body: newPath
    },
      function callBack() {
        setWriteTime();
      }
    );
  }

  const moveFile = (filepath, newPath) => {
    request(filepath, {
      method: "PUT",
      body: newPath
    },
      function callBack() {
        loadFiles(path);
        setWriteTime();
      }
    );
  }

  const moveToTarget = (filepath, operation) => {
    const newPath = activeTarget + (activeTarget === "/" ? "" : "/") + basename(filepath);
    if (operation === "copy") {
      copyFile(filepath, newPath);
      return;
    }
    moveFile(filepath, newPath);
  }

  const delFile = filepath => {
    request(filepath, {
      method: "DELETE"
    },
      function callBack() {
        loadFiles(path)
      }
    )
  }

  const newFile = () => {
    const newPath = path + (path === "/" ? "" : "/") + NewTimeStamp() + ".txt";
    request(newPath, {
      method: "POST",
      body: "newfile"
    },
      function callBack() {
        history.push(newPath)
      }
    )
  }

  const saveSort = (part, type) => {
    let all = merge(files.slice(), part, type);

    request("/sort" + path, {
      method: "POST",
      body: JSON.stringify(makeArr(all))
    },
      function callBack() {
        setFiles(all);
      }
    )
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} saveSort={saveSort} setActiveTarget={setActiveTarget} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={newFile} />
        <FileList files={filesOnly(files)} saveSort={saveSort} moveFile={moveFile} delFile={delFile} 
          moveToTarget={moveToTarget} />
      </section>
    </>
  )
}

const AddText = ({newFn}) => {
  return <button onClick={newFn}><NewTextIcon /></button>
}

export default DirView;

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


