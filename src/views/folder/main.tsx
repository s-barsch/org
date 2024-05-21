import React, { useContext } from 'react';
import All from 'views/all/main';
import { useNavigate } from 'react-router-dom';
import { dirname, join } from 'path-browserify';
import { isText, fileType } from 'funcs/paths';
import useView from 'state';
import File, { merge, removeFromArr } from 'funcs/files';
import { moveRequest, deleteRequest } from '../../funcs/requests';
import TextView from 'views/folder/views/text';
import DirView from 'views/folder/views/dir';
import { ErrContext } from 'context/err';
import MediaView from './views/media';
import { newTimestamp } from 'funcs/paths';

export type modFuncsObj = {
    createFile: () => void;
    deleteFile: (f: File) => void;
    moveFile: (f: File, newPath: string) => void;
}

type ViewProps = {
    path: string;
    files: File[];
    sorted: boolean;
}

export default function View({path, files, sorted}: ViewProps) {
    let { setErr } = useContext(ErrContext);
    const { update } = useView();

    const navigate = useNavigate();

    const modFuncs: modFuncsObj = {
        createFile:  createFile,
        deleteFile:     deleteFile,
        moveFile:       moveFile,
    }

    switch (fileType(path)) {
        case "text":
            return <TextView path={path} files={files} modFuncs={modFuncs} />;
        case "media":
            return <MediaView path={path} files={files} modFuncs={modFuncs} />;
        case "all":
            return <All path={path} files={files} />;
        default:
            return <DirView path={path} files={files} saveSort={saveSort} modFuncs={modFuncs} />
    }

  

    // meta
    async function moveFile(f: File, newPath: string) {
        await moveRequest(f.path, newPath, setErr);
        update(removeFromArr(files.slice(), f.name), sorted);
    }

    // meta, nav
    async function deleteFile(f: File) {
        let isSorted = sorted;
        if (f.name === ".sort") {
            isSorted = false;
        }
        await deleteRequest(f.path, setErr);
        update(removeFromArr(files.slice(), f.name), isSorted);
    }

    // text, dir view
    function createFile() {
        const dirPath = isText(path) ? dirname(path) : path;
        const filePath = join(dirPath, newTimestamp() + ".txt")
        navigate(filePath);
    }

    // list view
    async function saveSort(part: File[], type: string) {
        const newFiles = merge(files.slice(), part, type);
        update(newFiles, true);
    }
}