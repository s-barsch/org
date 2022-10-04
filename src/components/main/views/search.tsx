import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import Head from 'components/main/parts/head';
import File, { filesOnly } from 'funcs/files';
import { FileList } from 'components/main/parts/plain-list';


type DirViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}


export default function SearchView({path, files, mainFuncs, modFuncs}: DirViewProps) {

    return (
        <>
            <Head path={path} renameFn={mainFuncs.renameSearch} />
            <section id="files">
                <FileList files={filesOnly(files)} mainFuncs={mainFuncs} modFuncs={modFuncs} />
            </section>
        </>
    )
}