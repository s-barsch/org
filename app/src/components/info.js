import React from 'react';
import { basename } from 'path';
import { Link } from 'react-router-dom';
import Del from './del';

const Info = ({file, delFn}) => {
  return (
    <div className="fileinfo">
      <Link className="filename" to={file.path}>{basename(file.path)}</Link> ({file.type}) <Del file={file} delFn={delFn} />
    </div>
  )
}

export default Info;
