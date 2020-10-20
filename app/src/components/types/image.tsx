import React from 'react';
import TextField from './text';
import { Del } from '../meta';
import { basename } from 'path';
import File from '../../funcs/file';
import { ModFuncs } from '../../types';

type ImageProps = {
    file: File;
    modFuncs: ModFuncs;
}

function Image({file, modFuncs}: ImageProps) {
    const path = file.path + ".info"

    const info: File = {
        id:   Date.now(),
        path: path,
        name: basename(path),
        type: "info",
        body: ""
    }

    return (
        <div>
        <img alt="" src={"/file" + file.path} />
        <Del file={file} deleteFile={modFuncs.deleteFile} />
        <TextField file={info} modFuncs={modFuncs} isSingle={false} />
        </div>
    )
}

export default Image;

