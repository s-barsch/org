import React from 'react';
import { Del } from 'components/main/files/meta';
import File from 'funcs/files';
import { modFuncsObj } from 'components/main/main';
import Info from './info';

type VideoProps = {
    file: File;
    modFuncs: modFuncsObj;
}

export default function Video({file, modFuncs}: VideoProps) {
    return (
        <div>
        <video src={"/file" + file.path}></video>
        <Del file={file} deleteFile={modFuncs.deleteFile} />
        <Info mainFilePath={file.path} modFuncs={modFuncs} />
        </div>
    )
}

