import React from 'react';
import Text from './text';
import { Del } from '../meta';

const Image = ({file, delFn}) => {
  const info = {
    path: file.path + ".info",
    type: "info"
  }
  return (
    <>
      <img alt="" src={"/file" + file.path} />
      <Del file={file} delFn={delFn} />
      <Text file={info} delFn={delFn} />
    </>
  )
}

export default Image;

