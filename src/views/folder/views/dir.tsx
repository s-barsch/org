import React from 'react';
import { modFuncsObj } from 'views/folder/main';
import Head from 'parts/head/main';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'views/folder/list';
import { AddDir, AddText } from 'views/folder/add';
import { HotKeys } from "react-hotkeys";

type DirViewProps = {
    path: string;
    files: File[];
    addNewDir: (name: string) => void;
    renameView: (name: string) => void;
    saveSort: (part: File[], type: string) => void;
    modFuncs: modFuncsObj;
}


export default function DirView({path, files, addNewDir, renameView, saveSort, modFuncs}: DirViewProps) {
const keyMap = {
    NEW_TEXT: "ctrl+enter"
};

const handlers = {
    NEW_TEXT: modFuncs.createFile
};

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <Head path={path} renameFn={renameView} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={saveSort} />
                <AddDir addNewDir={addNewDir} />
            </nav>
            <section id="files">
                <AddText createFile={modFuncs.createFile} />
                <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={saveSort} />
            </section>
        </HotKeys>
    )
}


