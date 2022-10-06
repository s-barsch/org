import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { TargetsContext } from 'context/targets';
import { basename, dirname, join } from 'path';
import { isText, isSearch } from 'funcs/paths';
import { orgSort } from 'funcs/sort';
import { mainObj } from 'app';
import File, { newFile, merge, insertBefore, createDuplicate, 
    isPresent, removeFromArr } from 'funcs/files';
import { saveSortRequest, newDirRequest, moveRequest, writeRequest,
    copyRequest, newFileRequest, deleteRequest, renameViewRequest } from './requests';
import TextView from 'components/main/views/text';
import DirView from 'components/main/views/dir';
import SearchView from 'components/main/views/search';
import { ErrContext } from 'context/err';


export type mainFuncsObj = {
    createNewFile: () => void;
    addNewDir: (name: string) => void;
    renameView: (name: string) => void;
    saveSort: (part: File[], type:string) => void;
}

export type modFuncsObj = {
    writeFile: (f: File) => void;
    duplicateFile: (f: File) => void;
    deleteFile: (f: File) => void;

    moveFile: (f: File, newPath: string) => void;
    copyFile: (f: File, newPath: string) => void;
    renameFile: (oldPath: string, f: File) => void;

    copyToTarget: (f: File) => void;
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
        copyFile:       copyFile,
        renameFile:     renameFile,
        duplicateFile:  duplicateFile,
        copyToTarget:   copyToTarget,
        moveToTarget:   moveToTarget,
    }

    const mainFuncs: mainFuncsObj = {
        createNewFile:  createNewFile,
        addNewDir:      addNewDir,
        renameView:     renameView,
        saveSort:       saveSort
    }

    if (isText(path)) {
        return <TextView path={path} files={files}
            mainFuncs={mainFuncs} modFuncs={modFuncs} />;
    }

    if (isSearch(path)) {
        return <SearchView path={path} files={files}
            mainFuncs={mainFuncs} modFuncs={modFuncs} />;
    }

    return <DirView path={path} files={files} mainFuncs={mainFuncs} modFuncs={modFuncs} />

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
        writeRequest(f.path, f.body, setErr);
    }

    async function renameView(newName: string) {
        let oldName = basename(path);
        let newPath = join(dirname(path), newName);

        if (isText(path)) {
            const newFiles = renameText(files.slice(), oldName, newName)
            update(newFiles, sorted);
        }

        await renameViewRequest(path, newPath, setErr);
        history.push(newPath);
    }

    function renameFile(oldPath: string, f: File) {
        let newFiles = files.slice()
        if (!sorted) {
            newFiles = orgSort(newFiles)
        }
        update(newFiles, sorted);
        moveRequest(oldPath, f.path, setErr);
    }

    function duplicateFile(f: File) {
        let newFile: File;
        try {
            newFile = createDuplicate(f, files);
        } catch(err) {
            alert(err);
            return;
        }

        update(insertDuplicateFile(files.slice(), f, newFile, sorted), sorted);
        writeRequest(newFile.path, newFile.body, setErr);
    }

    function copyFile(f: File, newPath: string) {
        copyRequest(f.path, newPath, setErr);
    }

    function moveFile(f: File, newPath: string) {
        update(removeFromArr(files.slice(), f.name), sorted);
        moveRequest(f.path, newPath, setErr);
    }

    function copyToTarget(f: File) {
        copyFile(f, join(targets.active, f.name));
    }

    function moveToTarget(f: File) {
        moveFile(f, join(targets.active, f.name));
    }

    function deleteFile(f: File) {
        if (f.name === ".sort") {
            sorted = false;
        }
        update(removeFromArr(files.slice(), f.name), sorted);
        deleteRequest(f.path, setErr);
    }

    function createNewFile() {
        const dirPath = isText(path) ? dirname(path) : path;
        const f = newFile(dirPath);
        const newFiles = insertNewFile(files.slice(), f, sorted);

        update(newFiles, sorted);
        newFileRequest(f.path, setErr);
        history.push(f.path);
    }

    async function saveSort(part: File[], type: string) {
        const New = merge(files.slice(), part, type);
        update(New, true);
    }

}

function insertDuplicateFile(files: File[], f: File, newFile: File, isSorted: boolean) {
    if (isSorted) {
        return insertBefore(files, f, newFile);
    }
    return orgSort(files.concat(newFile));
}

function insertNewFile(files: File[], f: File, isSorted: boolean): File[] {
    if (isSorted) {
        return [f].concat(files)
    }
    return orgSort(files.concat(f))
}

function renameText(files: File[], oldName: string, newName: string): File[] {
    const f = files.find(f => f.name === oldName);
    if (!f) {
        throw new Error("renameText: Couldn’t find file. " + oldName)
    }
    f.path = join(dirname(f.path), newName);
    f.name = newName;
    return files
}

function insertNewDir(files: File[], path: string, isSorted: boolean): File[] {
    let f = {
        id:   Date.now(),
        name: basename(path),
        path: path,
        type: "dir",
        body: ""
    }
    let newFiles = files.concat(f)
    if (!isSorted) {
        return orgSort(newFiles);
    }
    return newFiles;
}

