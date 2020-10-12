import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as p from '../funcs/paths';
//import DragIcon from '@material-ui/icons/Menu';
import DeleteIcon from '@material-ui/icons/ClearSharp';
import EditIcon from '@material-ui/icons/Edit';

const BotToggle = ({file, moveFile}) => {
  const target = p.Base(p.Dir(file.path)) === "bot" ? "top" : "bot";

  const move = () => {
    const i = file.path.lastIndexOf("/")
    let newPath;

    if (target === "bot") {
        newPath = file.path.substr(0, i) + "/bot" + file.path.substr(i)
    }
    if (target === "top") {
        newPath = file.path.substr(0, i-4) + file.path.substr(i);
    }

    moveFile(file.path, newPath);
    return;
  }

  return <button className="info__bot" onClick={move}>{target}</button>
}

const Info = ({file, modFuncs}) => {
  const moveToTarget = evt => {
    modFuncs.moveToTarget(file.path);
  }
  const copyToTarget = evt => {
    modFuncs.copyToTarget(file.path);
  }
  const duplicateFile = evt => {
    modFuncs.duplicateFile(file.path);
  }

  return (
    <div className="info">
      <FileName file={file} moveFile={modFuncs.moveFile} /> 
      <BotToggle file={file} moveFile={modFuncs.moveFile} />
      <button className="info__dupli" onClick={duplicateFile}>⧺</button>
      <img className="rarr" alt="Copy" src="/rarrc.svg" onClick={copyToTarget} />
      <img className="rarr" alt="Move" src="/rarr.svg" onClick={moveToTarget} />
      <span className="info__drag"></span>
      <span className="info__del">
        <Del file={file} delFile={modFuncs.delFile} />
      </span>
    </div>
  )
}
  
const FileName = ({file, moveFile}) => {
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState("");

  const ref = useRef(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    setName(file.name);
  }, [file]);

  useEffect(() => {
    if (edit) {
      ref.current.focus({preventScroll:true})
    }
  }, [edit]);

  const handleTyping = evt => {
    setName(evt.target.value);
  }

  const toggleEdit = evt => {
    setEdit(!edit);
  }

  const renameFile = evt => {
    setEdit(false);
    if (name === file.Name) {
      return;
    }
    moveFile(file.path, p.Join(p.Dir(file.path), name));
  }

  return (
    <span className="info__file">
      <FileLink file={file} isEdit={edit}>
        <input disabled={edit ? "" : "disabled"} size={name.length} value={name} onChange={handleTyping} ref={ref} onBlur={renameFile} className="info__rename" />
      </FileLink>
    <button onClick={toggleEdit} className="info__edit"><EditIcon /></button>
      <span className="info__type">{file.type}</span>
    </span>
  )
}

const FileLink = ({ file, isEdit, children }) => {
  return isEdit ? children : <Link className="info__name" to={file.path}>{children}</Link>
}

const Del = ({file, delFile}) => {
  const del = () => {
    if (window.confirm("Delete this " + file.type + "?")) {
      delFile(file.path);
    }
  }
  return <button className="del" onClick={del}><DeleteIcon /></button>
}

export { Del, Info };
