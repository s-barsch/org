import React from 'react';

import Head from 'components/main/parts/head';
import Text from 'components/main/files/text';
import File, { newFile } from 'funcs/files';

import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { basename } from 'path';

type TextViewProps = {
    path: string;
    files: File[];
    renameView: (name: string) => void;
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export default function TextView({path, files, renameView, mainFuncs, modFuncs}: TextViewProps) {
    let { text, isNew } = findText(files, path);
    return (
        <>
            <Head path={path} isNew={isNew} disabled={isNew} renameFn={renameView} />
            <Text file={text} createNewText={mainFuncs.createNewFile} 
            writeText={modFuncs.writeFile} isSingle={true} />
        </>
    )
}

function findText(files: File[], path: string): { text: File; isNew: boolean; } {
    const f = newFile(path)
    if (!files || files.length === 0) {
        return { text: f, isNew: true }
    }

    const name = basename(path);
    const text = files.find(f => f.name === name);

    if (!text) {
        return { text: f, isNew: true }
    }
    return { text: text, isNew: false }
    /*
    if (!text) {
        return <>{'Couldn’t find text: ' + name + '.'}</>
    }
    */
}