import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReverseIcon from '@material-ui/icons/SwapVert';
import { ReactSortable } from 'react-sortablejs';
import { basename } from 'path';
import { Info } from '../meta';
import Text from '../types/text';
import Image from '../types/image';

const FileEntry = ({file, modFuncs}) => {
  return (
    <FileSwitch file={file} modFuncs={modFuncs} />
  )
}

const FileSwitch = ({file, modFuncs, single}) => {
  if (file.name === ".sort") {
    return <div className="no-sort"><Info file={file} modFuncs={modFuncs} /></div>
  }
  switch (file.type) {
    case "text":
      return <Text file={file} modFuncs={modFuncs} single={single}/>
    case "image":
      return <Image file={file} modFuncs={modFuncs} />
    default:
      return <Info file={file} modFuncs={modFuncs} />
  }
}

const FileList = ({files, saveSort, modFuncs}) => {
  const [state, setState] = useState(files);

  useEffect(() => {
    setState(files);
  }, [files])
  
  const reverseFiles = () => {
    const reverse = preSort(state.slice().reverse());
    saveSort(reverse, "files");
  }

  const callOnEnd = () => {
    saveSort(state, "files");
  };

  if (!files || files.length === 0) {
    return null
  }
  // filter=".no-sort"
  return (
    <>
      <span className="right">
        <button onClick={reverseFiles}><ReverseIcon /></button>
      </span>
      <ReactSortable 
      handle=".info__drag" 
      onEnd={callOnEnd}
      animation={200} list={state} setList={setState}>
      { state.map((file, i) => (
        <FileEntry key={file.id} file={file} modFuncs={modFuncs}/>
      ))}
      </ReactSortable>
    </>
  );
}

const Dir = ({dir, setActiveTarget}) => {
  const setTarget = evt => {
    if (evt.shiftKey) {
      evt.preventDefault();
      setActiveTarget(evt.target.pathname);
    }
  }
  return (
    <Link to={dir.path} onClick={setTarget}>{basename(dir.path)}</Link>
  )
}

const DirList = ({dirs, saveSort, setActiveTarget }) => {
  const [state, setState] = useState(dirs);

  useEffect(() => {
    setState(dirs);
  }, [dirs])

  const callOnEnd = () => {
    saveSort(state, "dirs");
  };

  return (
    <ReactSortable className="dirs__list" onEnd={callOnEnd}
    animation={200} list={state} setList={setState}>
    {state.map((dir) => (
      <Dir key={dir.id} dir={dir} setActiveTarget={setActiveTarget} />
    ))}
    </ReactSortable>
  )
}

export { DirList, FileList, FileSwitch };

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

