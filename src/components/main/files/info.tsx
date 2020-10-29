import React from 'react';

import TextField from './text';
import { newInfoFile } from 'funcs/files';

import { modFuncsObj } from '../main';

type InfoFileProps = {
    mainFilePath: string;
    modFuncs: modFuncsObj;
}

export default function Info({ mainFilePath, modFuncs }: InfoFileProps) {
    const info = newInfoFile(mainFilePath);
    return (
        <TextField file={info} modFuncs={modFuncs} isSingle={false} />
    )
}
