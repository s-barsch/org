import React from 'react';
import { ModFuncs } from 'components/main/view';
import Head from 'components/main/head';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'components/main/list';
import { AddDir, AddText } from 'components/main/add';

type DirViewProps = {
    path: string;
    files: File[];
    modFuncs: ModFuncs;
}

export default function DirView({path, files, modFuncs}: DirViewProps) {
    return (
        <>
            <Head path={path} renameView={modFuncs.renameView} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={modFuncs.saveSort} />
                <AddDir addNewDir={modFuncs.addNewDir} />
            </nav>
            <section id="files">
                <AddText createNewFile={modFuncs.createNewFile} />
                <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={modFuncs.saveSort} />
            </section>
        </>
    )
}


