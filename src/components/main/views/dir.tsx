import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import Head from 'components/main/parts/head';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'components/main/parts/sort-list';
import { AddDir } from 'components/main/parts/add';
import { navObj, errObj } from 'app';
import Nav from 'components/nav/nav';
import { HotKeys } from "react-hotkeys";

type DirViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
    err: errObj;
    nav: navObj;
}


export default function DirView({path, files, mainFuncs, modFuncs, nav, err}: DirViewProps) {
const keyMap = {
    NEW_TEXT: "ctrl+enter"
};

const handlers = {
    NEW_TEXT: mainFuncs.createNewFile
};

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <Nav pathname={path} newFile={mainFuncs.createNewFile} nav={nav} err={err} />
            <Head path={path} renameView={mainFuncs.renameView} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={mainFuncs.saveSort} />
                <AddDir addNewDir={mainFuncs.addNewDir} />
            </nav>
            <section id="files">
                { /* 
                <AddText createNewFile={mainFuncs.createNewFile} />
                   */ }
                <FileList files={filesOnly(files)} mainFuncs={mainFuncs} modFuncs={modFuncs} saveSort={mainFuncs.saveSort} />
            </section>
        </HotKeys>
    )
}


