import React from 'react';
import { useHistory } from 'react-router-dom';
import Head from 'components/head/main';
import File, { filesOnly } from 'funcs/files';
import { FileList } from './list';
import { dirname, join } from 'path';

export function SearchView({path, files}: {path: string, files: File[]}) {
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
                <FileList files={filesOnly(files)} />
            </section>
        </>
    )
}