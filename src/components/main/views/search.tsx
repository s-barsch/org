import React from 'react';
import { useHistory } from 'react-router-dom';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import Head from 'components/main/parts/head';
import File, { filesOnly } from 'funcs/files';
import { FileList } from 'components/main/parts/plain-list';
import { dirname, join } from 'path';


type DirViewProps = {
    path: string;
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}


export default function SearchView({path, files, mainFuncs, modFuncs}: DirViewProps) {
    const history = useHistory();

    function renameSearch(newName: string) {
        let dir = dirname(path);
        if (path === '/search') {
            dir = path;
        }

        history.push(join(dir, newName));
    }

    return (
        <>
            <Head path={path} renameFn={renameSearch} />
            <section id="files">
                <FileList files={filesOnly(files)} mainFuncs={mainFuncs} modFuncs={modFuncs} />
            </section>
        </>
    )
}