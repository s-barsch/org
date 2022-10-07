import React from 'react';
import { Del } from 'components/main/files/meta';
import File from 'funcs/files';
import { modFuncsObj } from 'components/main/main';
import Info from './info';

type ImageProps = {
    file: File;
    modFuncs: modFuncsObj;
}

export default function Image({file, modFuncs}: ImageProps) {
    return (
        <div>
        <img alt="" src={"/file" + file.path} />
        <Del file={file} deleteFile={modFuncs.deleteFile} />
        <br /><button>+ Info</button>
        <Info mainFilePath={file.path} modFuncs={modFuncs} />
        </div>
    )
}
