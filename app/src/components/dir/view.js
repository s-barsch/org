import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AddDir from './add';
import { NewTimeStamp } from '../../funcs/paths';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';
import { TargetsContext } from '../../targets';
import { basename, dirname, extname, join } from 'path';
import * as p from '../../funcs/paths';
import { separate, orgSort } from '../../funcs/sort';

const mockFiles = () => {
  const name = p.NewTimeStamp();
  let arr = [];
  const file = {
    path: "/sample/",
    name: "",
    type: "text",
    body: ""
  }
  for (let i = 0; i <= 2; i++) {
    let f = Object.assign({}, file);
    f.id = i;
    f.name = name + "+" + i + ".txt";
    f.path = f.path + f.name;
    arr.push(f);
  }
  return arr
}


function DirView({view}) {
  const { setActiveTarget, activeTarget } = useContext(TargetsContext);

  const [path, setPath] = useState(view.file.path);

  useEffect(() => {
    setPath(view.file.path);
  }, [view]);

  const [files, setFiles] = useState(mockFiles());
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    setFiles(orgSort(view.files));
    setSorted(view.sorted);
  }, [view]);


  const history = useHistory();

  async function request(path, options, callback) {
    try {
      const resp = await fetch(path, options);
      if (!resp.ok) {
        const text = await resp.text();
        alert("fetch failed: " + path + "\nreason: " + text);
        return;
      }
      if (callback) {
        callback();
      }
    } catch(err) {
      console.log(err)
    }
  }

  const addNewDir = async (name) => {
    if (name === "") {
      return;
    }
    if (isPresent(files, name)) {
      alert("Dir with this name already exists.");
      return;
    }

    let f = {
      id: files.length+100,
      name: name,
      path: join(path, name),
      type: "dir"
    }

    let added = files.slice().concat(f);

    if (sorted) {
      setFiles(separate(added));
    } else {
      setFiles(orgSort(added));
    }

    request("/api/write" + join(path, name));
  }

  const setWriteTime = () => {
    localStorage.setItem("write", Date.now())
  }


  const copyFile = (filepath, newPath) => {
    request("/api/copy" + filepath, {
      method: "POST",
      body: newPath
    },
      function callBack() {
        setWriteTime();
      }
    );
  }

  const moveFile = (filepath, newPath) => {
    request("/api/move" + filepath, {
      method: "POST",
      body: newPath
    },
      function callBack() {
        setWriteTime();
      }
    );
  }

  // 120912+2.txt -> 120912.txt
  const splitName = name => {
    let ext = extname(name);
    let trunk = name.substr(0, name.length-ext.length);

    const x = trunk.indexOf("+");
    if (x >= 0) {
      trunk = trunk.substr(0, x);
    }
    return {
      trunk: trunk,
      ext: ext
    }
  }

  const isPresent = (files, name) => {
    for (const f of files) {
      if (f.name === name) {
        return true
      }
    }
    return false
  }

  const createDuplicate = (file, files) => {
    let f = Object.assign({}, file);

    let name = splitName(f.name);
    for (let i = 1; i < 10; i++) {
      const newName = name.trunk + "+" + i + name.ext; 
      if (!isPresent(files, newName)) {
        f.id = files.length + 100;
        f.name = newName;
        f.path = dirname(f.path) + "/" + newName;
        console.log(file.path);
        console.log(f.path);

        return f;
      }
    }
  }

  const insert = (files, file, newFile) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].name === file.name) {
        files.splice(i, 0, newFile)
        return files;
      }
    }
    alert("Couldn’t insert duplicate.");
    return;
  }

  const duplicateFile = file => {
    const newFile = createDuplicate(file, files);
    if (!newFile) {
      alert("Couldn’t create duplicate: no free name available.");
      return;
    }
    setFiles(insert(files.slice(), file, newFile))

    request("/api/write" + newFile.path, {
      method: "POST",
      body: newFile.body
    });
  }

  const copyToTarget = (filepath) => {
    copyFile(filepath, p.Join(activeTarget, basename(filepath)));
  }

  const moveToTarget = (filepath, operation) => {
    moveFile(filepath, p.Join(activeTarget, basename(filepath)));
  }

  const removeFromArr = (files, name) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].name === name) {
        files.splice(i, 1)
        break;
      }
    }
    return files;
  }

  const deleteFile = file => {
    setFiles(removeFromArr(files.slice(), file.name));
    request("/api/delete" + file.path)
  }

  const newFile = () => {
    const newPath = path + (path === "/" ? "" : "/") + NewTimeStamp() + ".txt";
    request("/api/write" + newPath, {
      method: "POST",
      body: "newfile"
    },
      function callBack() {
        history.push(newPath)
      }
    )
  }

  const saveSort = (part, type) => {
    /*
    let all = merge(files.slice(), part, type);
    setFiles(all);
    */

    /*
    request("/api/sort" + path, {
      method: "POST",
      body: JSON.stringify(makeArr(all))
    },
      function callBack() {
      }
    )
    */
  }

  const modFuncs = {
    duplicateFile: duplicateFile,
    deleteFile: deleteFile,
    moveFile: moveFile,
    copyToTarget: copyToTarget,
    moveToTarget: moveToTarget
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} saveSort={saveSort} setActiveTarget={setActiveTarget} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={newFile} />
        <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={saveSort} />
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


/*
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

*/

  /*
  async function loadFiles(path) {
    try {
      console.log("LOAD FILES");
      let favicon = document.querySelector('link[rel="icon"]');
      favicon.href = "/blue.svg";

      const resp = await fetch("/api/list" + path);
      const arr  = await resp.json();

      setFiles(orgSort(arr));

      setTimeout(() => {
        favicon.href = "/" + p.Section(path) + ".svg";
      }, 10);
    } catch(err) {
      console.log("loadFiles error. path: " + path + "\nerr: " + err);
    }
  }
  */
  /*
  const listenForWrite = useCallback(evt => {
    loadFiles(path);
  }, [path]);

  useEffect(() => {
    window.addEventListener('storage', listenForWrite);

    return () => {
      window.removeEventListener('storage', listenForWrite);
    };
  }, [listenForWrite]);
  */


/*
const numerate = files => {
  if (!files) {
    return [];
  }
  for (let i = 0; i < files.length; i++) {
    files[i].id = i
  }
  return files;
}
*/
