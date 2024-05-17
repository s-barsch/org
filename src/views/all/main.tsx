import React from 'react';
import File, { filesOnly } from 'funcs/files';
import { FileList } from 'views/search/list'

type AllViewProps = {
    path: string;
    files: File[];
}

export default function All({path, files}: AllViewProps){
    return (
        <section id="files">
        <FileList files={filesOnly(files)} />
        </section>
    );
}