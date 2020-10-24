import React from 'react';

import Head from 'components/main/head';
import Text from 'components/types/text';
import File from 'funcs/files';

import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { basename } from 'path';

type TextViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export default function TextView({path, files, mainFuncs, modFuncs}: TextViewProps) {
    if (!files || files.length === 0) {
        return <>No files found.</>;
    }

    const name = basename(path);
    const text = files.find(f => f.name === name);

    if (!text) {
        return <>{'Couldn’t find text: ' + name + '.'}</>
    }

    return (
        <>
            <Head path={path} renameView={mainFuncs.renameView} />
            <Text file={text} modFuncs={modFuncs} isSingle={true} />
        </>
    )
}


