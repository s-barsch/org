import React from 'react';
import DeleteIcon from '@material-ui/icons/ClearSharp';

const Del = ({ file, delFn }) => {
  const del = () => {
    if (window.confirm("Delete this " + file.type + "?")) {
      delFn(file.path);
    }
  }
  return <button className="del" onClick={del}><DeleteIcon /></button>
}

export default Del;
