import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/view/main';
import Head from 'components/head/main';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'components/view/parts/list';
import { AddDir, AddText } from 'components/view/parts/add';
import { HotKeys } from "react-hotkeys";

type DirViewProps = {
    path: string;
    files: File[];
    renameView: (name: string) => void;
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}


export default function DirView({path, files, renameView, mainFuncs, modFuncs}: DirViewProps) {
const keyMap = {
    NEW_TEXT: "ctrl+enter"
};

const handlers = {
    NEW_TEXT: mainFuncs.createNewFile
};

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <Head path={path} renameFn={renameView} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={mainFuncs.saveSort} />
                <AddDir addNewDir={mainFuncs.addNewDir} />
            </nav>
            <section id="files">
                <AddText createNewFile={mainFuncs.createNewFile} />
                <FileList files={filesOnly(files)} createNewFile={mainFuncs.createNewFile}
                    modFuncs={modFuncs} saveSort={mainFuncs.saveSort} />
            </section>
        </HotKeys>
    )
}


