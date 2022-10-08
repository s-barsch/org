import React from 'react';
import File from 'funcs/files';
import { modFuncsObj } from 'components/view/main';
import AddInfo from 'components/view/parts/add-info'

type VideoProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSingle?: boolean;
}

export default function Video({file, modFuncs, isSingle}: VideoProps) {
    if (isSingle) {
        return (
            <video controls src={"/file" + file.path}></video>
        )
    } else {
        return (
            <div className="list-media">
                <video controls src={"/file" + file.path}></video>
                <AddInfo mainFilePath={file.path}></AddInfo>
            </div>
        )
    }
}

