import React from 'react';
import File from 'funcs/files';
import { modFuncsObj } from 'components/main/main';
import Info from './info';
import AddInfo from '../parts/add-info';

type ImageProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSingle?: boolean;
}

export default function Image({file, modFuncs, isSingle}: ImageProps) {
    if (isSingle) {
        return <img alt="" src={"/file" + file.path} />
    } else {
        return (
            <div className="list-media">
                <img alt="" src={"/file" + file.path} />
                <AddInfo mainFilePath={file.path}></AddInfo>
                <Info mainFilePath={file.path} modFuncs={modFuncs} />
            </div>
        )
    }
}
