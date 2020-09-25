import React from 'react';
import Del from './del';
import Text from './text';

const Image = ({file, delFn}) => {
  const info = {
    path: file.path + ".info",
    type: "info"
  }
  return (
    <>
      <img src={"/files" + file.path} />
      <Del file={file} delFn={delFn} />
      <Text file={info} delFn={delFn} />
    </>
  )
}

export default Image;

