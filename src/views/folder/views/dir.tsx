import React from 'react';
import { modFuncsObj } from 'views/folder/main';
import Head from 'parts/head/main';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'views/folder/list';
import { AddDir, AddText } from 'views/folder/add';
import { HotKeys } from 'react-hotkeys';
import useView from 'state';

type DirViewProps = {
    path: string;
    files: File[];
    modFuncs: modFuncsObj;
}


export default function DirView({path, files, modFuncs}: DirViewProps) {
    const keyMap = {
        NEW_TEXT: "ctrl+enter"
    };

    const handlers = {
        NEW_TEXT: modFuncs.createFile
    };

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <Head path={path} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} />
                <AddDir />
            </nav>
            <section id="files">
                <AddText createFile={modFuncs.createFile} />
                <FileList files={filesOnly(files)} modFuncs={modFuncs} />
            </section>
        </HotKeys>
    )
}


