import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import Head from 'components/main/parts/head';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'components/main/parts/list';
import { AddDir, AddText } from 'components/main/parts/add';

type DirViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export default function DirView({path, files, mainFuncs, modFuncs}: DirViewProps) {
    return (
        <>
            <Head path={path} renameView={mainFuncs.renameView} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={mainFuncs.saveSort} />
                <AddDir addNewDir={mainFuncs.addNewDir} />
            </nav>
            <section id="files">
                <AddText createNewFile={mainFuncs.createNewFile} />
                <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={mainFuncs.saveSort} />
            </section>
        </>
    )
}


