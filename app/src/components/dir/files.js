import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReverseIcon from '@material-ui/icons/SwapVert';
import { ReactSortable } from 'react-sortablejs';
import { basename } from 'path';
import { Info } from '../meta';
import Text from '../types/text';
import Image from '../types/image';

const FileList = ({files, saveSort, moveFile, delFile}) => {
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
        <FileEntry key={file.id} file={file} moveFile={moveFile} delFile={delFile} />
      ))}
      </ReactSortable>
    </>
  );
}

const FileEntry = ({ file, moveFile, delFile }) => {
  return (
    <FileSwitch file={file} moveFile={moveFile} delFile={delFile} />
  )
}

const FileSwitch = ({file, moveFile, delFile, single}) => {
  switch (file.type) {
    case "text":
      return <Text file={file} moveFile={moveFile} delFile={delFile} single={single} />
    case "image":
      return <Image file={file} moveFile={moveFile} delFile={delFile} />
    default:
      return <Info file={file} moveFile={moveFile} delFile={delFile} />
  }
}

const Dir = ({dir}) => {
  return (
    <Link to={dir.path}>{basename(dir.path)}</Link>
  )
}

const DirList = ({dirs, saveSort}) => {
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
      <Dir key={dir.id} dir={dir} />
    ))}
    </ReactSortable>
  )
}

export { DirList, FileList, FileSwitch};

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

