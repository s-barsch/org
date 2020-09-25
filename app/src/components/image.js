import React from 'react';
import { Del } from './info';

const Image = ({file, delFn}) => {
  return (
    <>
      <img src={"/files" + file.path} />
      <Del file={file} delFn={delFn} />
    </>
  )
}

export default Image;

