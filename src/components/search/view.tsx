import React from 'react';
import { useNavigate } from 'react-router-dom';
import Head from 'components/head/main';
import File, { filesOnly } from 'funcs/files';
import { FileList } from './list';
import { dirname, join } from 'path';

export function SearchView({path, files}: {path: string, files: File[]}) {
    const navigate = useNavigate();

    function renameSearch(newName: string) {
        let dir = dirname(path);
        if (path === '/search') {
            dir = path;
        }

        navigate(join(dir, newName));
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