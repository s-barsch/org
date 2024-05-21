import React from 'react';
import Head from 'parts/Head';
import File, { dirsOnly, filesOnly } from 'funcs/files';
import { DirList, FileList } from 'views/folder/parts/lists';
import { AddDir, AddText } from 'views/folder/parts/AddDir';
import { HotKeys } from 'react-hotkeys';
import useView from 'state';
import { useNavigate } from 'react-router';

type DirViewProps = {
    path: string;
    files: File[];
}


export default function DirView({path, files}: DirViewProps) {
    const navigate = useNavigate();
    const { createFilePath } = useView();

    function createFile() {
        navigate(createFilePath());
    }

    const keyMap = {
        NEW_TEXT: "ctrl+enter"
    };

    const handlers = {
        NEW_TEXT: createFile
    };

    return (
        <HotKeys keyMap={keyMap} handlers={handlers}>
            <Head path={path} />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} />
                <AddDir />
            </nav>
            <section id="files">
                <AddText createFile={createFile} />
                <FileList files={filesOnly(files)} />
            </section>
        </HotKeys>
    )
}


