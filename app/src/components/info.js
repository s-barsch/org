import React from 'react';
import { basename } from 'path';
import { Link } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/ClearSharp';

const Info = ({file, delFn}) => {
  return (
    <>
      <div>- <Link to={file.path}>{basename(file.path)}</Link> ({file.type}) <Del file={file} delFn={delFn} /></div>
    </>
  )
}

export default Info;

const Del = ({ file, delFn }) => {
  const del = () => {
    if (window.confirm("Delete this text?")) {
      delFn(file);
    }
  }
  return <button className="del" onClick={del}><DeleteIcon /></button>
}