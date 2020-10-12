import React from 'react';
import Text from './text';
import { Del } from '../meta';
import { basename } from 'path';

const Image = ({file, modFuncs}) => {
  const path = file.path + ".info"
  const info = {
    path: path,
    name: basename(path),
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

