import React from 'react';
import { basename } from 'path';
import { Link } from 'react-router-dom';
import Del from './del';

const getTarget = path => {
  const i = path.lastIndexOf("/");
  // /abc/bot/file.txt
  if (i > 0 && path.length - i - 3) {
    // /abc/bot
    let cut = path.substr(0, i);
    // bot
    cut = cut.substr(cut.length-3);
    if (cut === "bot") {
      return "top"
    }
    return "bot"
  }
}

const BotToggle = ({file, moveFn}) => {
  const target = getTarget(file.path);

  const move = () => {
    const i = file.path.lastIndexOf("/")
    let newPath;

    if (target === "bot") {
        newPath = file.path.substr(0, i) + "/bot" + file.path.substr(i)
    }
    if (target === "top") {
        newPath = file.path.substr(0, i-4) + file.path.substr(i);
    }

    moveFn(file.path, newPath);
    return;
  }

  return <button className="info__bot" onClick={move}>{target}</button>
}

const Info = ({file, moveFn, delFn}) => {
  return (
    <div className="info">
      <Link className="info__name" to={file.path}>{basename(file.path)}</Link>
      <span className="info__type">{file.type}</span>
      <BotToggle file={file} moveFn={moveFn} />
      <span className="info__del">
        <Del file={file} delFn={delFn} />
      </span>
    </div>
  )
}

export default Info;
