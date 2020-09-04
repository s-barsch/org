import React from 'react';
import { basename } from 'path';
import { Link } from 'react-router-dom';

const Info = ({file}) => {
  return (
    <>
      <div>- <Link to={file.path}>{basename(file.path)}</Link> ({file.type})</div>
    </>
  )
}

export default Info;
