import React from 'react';

import Head from 'components/main/parts/head';
import Text from 'components/main/files/text';
import File, { newFile } from 'funcs/files';

import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { basename } from 'path';

type TextViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export default function TextView({path, files, mainFuncs, modFuncs}: TextViewProps) {
    return (
        <>
            <Head path={path} renameFn={mainFuncs.renameView} />
            <Text file={findText(files, path)} createNewText={mainFuncs.createNewFile} writeText={modFuncs.writeFile} isSingle={true} />
        </>
    )
}

function findText(files: File[], path: string): File {
    if (!files || files.length === 0) {
        return newFile(path);
    }

    const name = basename(path);
    const text = files.find(f => f.name === name);

    if (!text) {
        return newFile(path);
    }
    return text
    /*
    if (!text) {
        return <>{'Couldn’t find text: ' + name + '.'}</>
    }
    */
}