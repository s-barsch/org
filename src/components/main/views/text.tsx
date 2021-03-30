import React from 'react';
import { navObj, errObj } from 'app';

import Nav from 'components/nav/nav';
import Head from 'components/main/parts/head';
import Text from 'components/main/files/text';
import File from 'funcs/files';

import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { basename } from 'path';

type TextViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
    nav: navObj;
    err: errObj;
}

export default function TextView({path, files, mainFuncs, modFuncs, nav, err}: TextViewProps) {
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
            <Nav pathname={path} newFile={mainFuncs.createNewFile} nav={nav} err={err} />
            <Head path={path} renameView={mainFuncs.renameView} />
            <Text file={text} mainFuncs={mainFuncs} modFuncs={modFuncs} isSingle={true} />
        </>
    )
}


