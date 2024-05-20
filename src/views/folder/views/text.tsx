import React from 'react';

import Head from 'parts/head/main';
import TextField from 'views/folder/files/text';
import File, { newFile } from 'funcs/files';

import { modFuncsObj } from 'views/folder/main';
import { basename } from 'path-browserify';

type TextViewProps = {
    path: string;
    files: File[];
    modFuncs: modFuncsObj;
}

export default function TextView({path, files, modFuncs}: TextViewProps) {
    let { text, isNew } = findText(files, path);
    return (
        <>
            <Head path={path} isNew={isNew} disabled={isNew} />
            <TextField file={text} createFile={modFuncs.createFile}
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