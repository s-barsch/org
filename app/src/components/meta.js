import React from 'react';
import { basename } from 'path';
import { Link } from 'react-router-dom';
import * as p from '../funcs/paths';
//import DragIcon from '@material-ui/icons/Menu';
import DeleteIcon from '@material-ui/icons/ClearSharp';

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

const Info = ({file, moveFile, delFile}) => {
  return (
    <div className="info">
      <span className="info__file">
        <Link className="info__name" to={file.path}>{basename(file.path)}</Link>
        <span className="info__type">{file.type}</span>
      </span>
      <BotToggle file={file} moveFile={moveFile} />
      <span className="info__drag"></span>
      <span className="info__del">
        <Del file={file} delFile={delFile} />
      </span>
    </div>
  )
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
