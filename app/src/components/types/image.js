import React from 'react';
import Text from './text';
import { Del } from '../meta';

const Image = ({file, modFuncs}) => {

  const info = {
    path: file.path + ".info",
    type: "info"
  }

  return (
    <div>
      <img alt="" src={"/file" + file.path} />
      <Del file={file} delFn={modFuncs.delFn} />
      <Text file={info} modFuncs={modFuncs} />
    </div>
  )
}

export default Image;

