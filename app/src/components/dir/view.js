import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AddDir from './add';
import Text from '../types/text';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';
import { TargetsContext } from '../../targets';
import { basename, extname, dirname, join } from 'path';
import { newTimestamp, isText } from '../../funcs/paths';
import { separate, orgSort } from '../../funcs/sort';

const newMockFile = (i) => {
  const name = newTimestamp() + "+" + i + ".txt";
  return {
    id:   i,
    path: "/sample/" + name,
    name: name,
    type: "text",
    body: ""
  }
}

const mockFiles = () => {
  let arr = [];
  for (let i = 0; i <= 2; i++) {
    arr.push(newMockFile(i));
  }
  return arr
}


function FileView({pathname, view, setView}) {
  const { setActiveTarget, activeTarget } = useContext(TargetsContext);

  const [path, setPath] = useState(pathname);
  const [files, setFiles] = useState(mockFiles());
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    setPath(pathname);
    setSorted(view.sorted);
    setFiles(view.files);
  }, [pathname, view])

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

  const update = (newFiles, isSorted) => {
    if (isSorted === undefined) {
      alert('invalid sorted attribute.');
    }

    if (!isSorted) {
      newFiles = orgSort(newFiles);
    }

    setFiles(newFiles);
    setSorted(isSorted);

    view.files = newFiles;
    view.sorted = isSorted;
    setView(view);
    

    if (isSorted) {
      request("/api/sort" + path, {
        method: "POST",
        body: JSON.stringify(makeArr(newFiles))
      });
    }
  }

  const addNewDir = name => {
    if (name === "") {
      return;
    }
    if (isPresent(files, name)) {
      alert("Dir with this name already exists.");
      return;
    }

    let f = {
      id:   Date.now(),
      name: name,
      path: join(path, name),
      type: "dir"
    }

    update(separate(files.slice().concat(f)), sorted)

    request("/api/write" + join(path, name));
  }

  const setWriteTime = () => {
    localStorage.setItem("write", Date.now());
  }

  const writeFile = file => {
    request("/api/write" + file.path, {
      method: "POST",
      body:   file.body
    });
  }

  // doesn’t leave the directory.
  const renameFile = (oldPath, file) => {
    update(files.slice(), sorted);
    request("/api/move" + oldPath, {
      method: "POST",
      body: file.path
    });
  }

  const duplicateFile = file => {
    const newFile = createDuplicate(file, files);
    if (!newFile) {
      alert("Couldn’t create duplicate: no free name available.");
      return;
    }

    if (sorted) {
      update(insert(files.slice(), file, newFile), sorted);
    } else {
      update(files.slice().concat(newFile), sorted);
    }

    request("/api/write" + newFile.path, {
      method: "POST",
      body: newFile.body
    });
  }

  const copyFile = (file, newPath) => {
    request("/api/copy" + file.path, {
      method: "POST",
      body: newPath
    },
      function callBack() {
        setWriteTime();
      }
    );
  }

  const moveFile = (file, newPath) => {
    setFiles(removeFromArr(files.slice(), file.name));
    request("/api/move" + file.path, {
      method: "POST",
      body: newPath
    },
      function callBack() {
        setWriteTime();
      }
    );
  }

  const copyToTarget = file => {
    copyFile(file, join(activeTarget, file.name));
  }

  const moveToTarget = file => {
    moveFile(file, join(activeTarget, file.name));
  }

  const deleteFile = file => {
    setFiles(removeFromArr(files.slice(), file.name));
    if (file.name === ".sort") {
      setSorted(false);
    }
    request("/api/delete" + file.path)
  }

  const createNewFile = () => {
    const name = newTimestamp() + ".txt";
    const f = {
      id: Date.now(),
      name: name,
      path: path + (path === "/" ? "" : "/") + name,
      type: "text",
      body: ""
    }

    update(separate(files.slice().concat(f)), sorted);

    request("/api/write" + f.path,
      {
        method: "POST",
        body: "newfile"
      },
      function callBack() {
        history.push(f.path)
      }
    )
  }

  const saveSort = async (part, type) => {
    setSorted(true);
    const New = merge(files.slice(), part, type);
    update(New, true);
  }

  const modFuncs = {
    writeFile: writeFile,
    duplicateFile: duplicateFile,
    deleteFile: deleteFile,
    moveFile: moveFile,
    renameFile: renameFile,
    copyToTarget: copyToTarget,
    moveToTarget: moveToTarget
  }

  if (isText(pathname)) {
    if (files.length === 0) {
      return "";
    }

    const text = findText(files, basename(pathname));
    if (!text) {
      return "Couldn’t find text."
    }

    return <Text file={text} modFuncs={modFuncs} single={true} />
  }

  return (
    <>
      <nav id="dirs">
        <DirList  dirs={dirsOnly(files)} saveSort={saveSort} setActiveTarget={setActiveTarget} />
        <AddDir submitFn={addNewDir} />
      </nav>
      <section id="files">
        <AddText newFn={createNewFile} />
        <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={saveSort} />
      </section>
    </>
  )
}

const AddText = ({newFn}) => {
  return <button onClick={newFn}><NewTextIcon /></button>
}

export default FileView;

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

/*
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
        favicon.href = "/" + p.section(path) + ".svg";
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
  const removeFromArr = (files, name) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].name === name) {
        files.splice(i, 1)
        break;
      }
    }
    return files;
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

  const createDuplicate = (file, files) => {
    let f = Object.assign({}, file);

    let name = splitName(f.name);
    for (let i = 1; i < 10; i++) {
      const newName = name.trunk + "+" + i + name.ext; 
      if (!isPresent(files, newName)) {
        f.id = Date.now();
        f.name = newName;
        f.path = dirname(f.path) + "/" + newName;
        return f;
      }
    }
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

const findText = (files, name) => {
  for (const f of files) {
    if (f.name === name) {
      return f;
    }
  }
}
