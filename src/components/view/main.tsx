import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { TargetsContext } from 'context/targets';
import { basename, dirname, join } from 'path';
import { isText, fileType } from 'funcs/paths';
import { orgSort } from 'funcs/sort';
import { mainObj } from 'app';
import File, { newFileDir, merge, insertNewDir, renameText, insertDuplicateFile,
    insertNewFile, createDuplicate, isPresent, removeFromArr, updateFile } from 'funcs/files';
import { saveSortRequest, newDirRequest, moveRequest, writeRequest,
    newFileRequest, deleteRequest } from './requests';
import TextView from 'components/view/views/text';
import DirView from 'components/view/views/dir';
import { ErrContext } from 'context/err';
import MediaView from './views/media';


export type mainFuncsObj = {
    createNewFile: () => void;
    addNewDir: (name: string) => void;
    saveSort: (part: File[], type:string) => void;
}

export type modFuncsObj = {
    writeFile: (f: File) => void;
    duplicateFile: (f: File) => void;
    deleteFile: (f: File) => void;

    moveFile: (f: File, newPath: string) => void;
    renameFile: (oldPath: string, f: File) => void;

    moveToTarget: (f: File) => void;
}

type MainProps = {
    path: string;
    files: File[];
    sorted: boolean;
    setMain: (main: mainObj) => void;
}

export default function Main({path, files, sorted, setMain}: MainProps) {
    let { targets } = useContext(TargetsContext);
    let { setErr } = useContext(ErrContext);


    const history = useHistory();

    const modFuncs: modFuncsObj = {
        writeFile:      writeFile,
        deleteFile:     deleteFile,
        moveFile:       moveFile,
        renameFile:     renameFile,
        duplicateFile:  duplicateFile,
        moveToTarget:   moveToTarget,
    }

    const mainFuncs: mainFuncsObj = {
        createNewFile:  createNewFile,
        addNewDir:      addNewDir,
        saveSort:       saveSort
    }

    switch (fileType(path)) {
        case "text":
            return <TextView path={path} files={files} renameView={renameView}
                mainFuncs={mainFuncs} modFuncs={modFuncs} />;
        case "media":
            return <MediaView path={path} files={files} renameView={renameView}
                mainFuncs={mainFuncs} modFuncs={modFuncs} />;
        default:
            return <DirView path={path} files={files} renameView={renameView}
            mainFuncs={mainFuncs} modFuncs={modFuncs} />
    }


    function update(newFiles: File[], isSorted: boolean) {
        setMain({
            sorted: isSorted,
            files:  newFiles
        });

        if (isSorted) {
            saveSortRequest(path, newFiles, setErr)
        }
    }

    function addNewDir(name: string) {
        if (isPresent(files, name)) {
            alert("Dir with this name already exists.");
            return;
        }

        const dirPath = join(path, name);

        update(insertNewDir(files.slice(), dirPath, sorted), sorted);
        newDirRequest(dirPath, setErr);
    }

    function writeFile(f: File) {
        update(updateFile(files.slice(), f, sorted), sorted)
        writeRequest(f.path, f.body, setErr);
    }

    // text, media, dir
    async function renameView(newName: string) {
        let oldName = basename(path);
        let newPath = join(dirname(path), newName);

        if (isText(path)) {
            const newFiles = renameText(files.slice(), oldName, newName)
            update(newFiles, sorted);
        }

        await moveRequest(path, newPath, setErr);
        history.push(newPath);
    }

    // meta
    function renameFile(oldPath: string, f: File) {
        let newFiles = files.slice()
        if (!sorted) {
            newFiles = orgSort(newFiles)
        }
        update(newFiles, sorted);
        moveRequest(oldPath, f.path, setErr);
    }

    // meta
    function duplicateFile(f: File) {
        let newF: File;
        try {
            newF = createDuplicate(f, files);
        } catch(err) {
            alert(err);
            return;
        }

        update(insertDuplicateFile(files.slice(), f, newF, sorted), sorted);
        writeRequest(newF.path, newF.body, setErr);
    }

    // meta
    function moveFile(f: File, newPath: string) {
        update(removeFromArr(files.slice(), f.name), sorted);
        moveRequest(f.path, newPath, setErr);
    }

    // meta
    function moveToTarget(f: File) {
        moveFile(f, join(targets.active, f.name));
    }

    // meta, nav
    function deleteFile(f: File) {
        if (f.name === ".sort") {
            sorted = false;
        }
        deleteRequest(f.path, setErr);
        update(removeFromArr(files.slice(), f.name), sorted);
    }

    // text, dir view
    function createNewFile() {
        const dirPath = isText(path) ? dirname(path) : path;
        const f = newFileDir(dirPath);
        const newFiles = insertNewFile(files.slice(), f, sorted);

        update(newFiles, sorted);
        newFileRequest(f.path, setErr);
        history.push(f.path);
    }

    // list view
    async function saveSort(part: File[], type: string) {
        const newFiles = merge(files.slice(), part, type);
        update(newFiles, true);
    }
}