import React from "react";
import File, { filesOnly } from 'funcs/files';
import { FileList } from 'components/search/list'

type AllViewProps = {
    path: string;
    files: File[];
}

export default function All({path, files}: AllViewProps){
    return (
        <>
        <br />
        <FileList files={filesOnly(files)} />
        </>
    );
}