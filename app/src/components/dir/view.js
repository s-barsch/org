import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AddDir from './add';
import { NewTimeStamp } from '../../funcs/paths';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';

function DirView({view}) {
  const [path, setPath] = useState(view.file.path);

  useEffect(() => {
    setPath(view.file.path);
  }, [view]);

  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadFiles(path);
  }, [path]);

  async function loadFiles(path) {
    try {
      const resp = await fetch("/api" + path + "?listing=true");
      const arr  = await resp.json();
      setFiles(numerate(arr));
    } catch(err) {
      console.log(err);
      alert("loadFiles error. path: " + path + "\nerr: " + err);
    }
  }

  const history = useHistory();

  async function request(path, options, callback) {
    try {
      const resp = await fetch("/api" + path, options);
      if (!resp.ok) {
        alert("fetch failed: " + path + "\nreason: " +resp.statusText);
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

  const moveFile = (filepath, newPath) => {
    request(filepath, {
      method: "PUT",
      body: newPath
    },
      function callBack() {
        loadFiles(path)
      }
    );
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
    const newPath = path + "/" + NewTimeStamp() + ".txt";
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

    /*
    if (p.IsPublic(path)) {
    }
    */
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
        <DirList  dirs={dirsOnly(files)} saveSort={saveSort} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={newFile} />
        <FileList files={filesOnly(files)} saveSort={saveSort} moveFile={moveFile} delFile={delFile} />
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


