import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import Head from 'components/main/parts/head';
import File, { filesOnly } from 'funcs/files';
import { FileList } from 'components/main/parts/plain-list';
import { navObj, errObj } from 'app';
import Nav from 'components/nav/nav';


type DirViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
    err: errObj;
    nav: navObj;
}


export default function SearchView({path, files, mainFuncs, modFuncs, nav, err}: DirViewProps) {

    return (
        <>
            <Nav pathname={path} nav={nav} err={err} />
            <Head path={path} renameFn={mainFuncs.renameSearch} />
            <section id="files">
                <FileList files={filesOnly(files)} mainFuncs={mainFuncs} modFuncs={modFuncs} />
            </section>
        </>
    )
}