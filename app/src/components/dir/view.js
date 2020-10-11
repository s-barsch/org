import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import AddDir from './add';
import { NewTimeStamp } from '../../funcs/paths';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';

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

  const moveFile = (filepath, newPath) => {
    req(
      filepath,
      { method: "PUT", body: newPath },
      () => { loadFiles(path) }
    )
  }

  const delFile = filepath => {
    req(
      filepath,
      { method: "DELETE" },
      () => { loadFiles(path) }
    )
  }

  const newFile = () => {
    const newPath = path + "/" + NewTimeStamp() + ".txt";
    req(
      newPath,
      { method: "POST", body: "newfile" },
      () => { history.push(newPath) }
    )
  }

  const saveSort = (part, type) => {
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


