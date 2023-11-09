import React from 'react';
import { useNavigate } from 'react-router-dom';
import Head from 'components/head/main';
import File, { filesOnly } from 'funcs/files';
import { FileList } from './list';
import { dirname, join } from 'path-browserify';
import { monthObj } from './main';
import TimeChart from './chart';

export function SearchView({path, months, files}: {path: string, months: monthObj[], files: File[]}) {
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
            <TimeChart months={months} />
            <section id="files">
                <FileList files={filesOnly(files)} />
            </section>
        </>
    )
}
