import React, { useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import NewTextIcon from '@material-ui/icons/Flare';
import AddDir from 'components/main/add';
import Text from 'components/types/text';
import { TargetsContext } from 'context/targets';
import { basename, dirname, join } from 'path';
import { newTimestamp, isText } from 'funcs/paths';
import { orgSort } from 'funcs/sort';
import File from 'funcs/file';
import { DirList, FileList } from 'components/main/files';
import RenameInput from 'components/main/rename';
import { Main, errObj } from 'app';
import { filesOnly, dirsOnly, merge, insertBefore, createDuplicate, 
    isPresent, removeFromArr } from './list';
import { saveSortRequest, newDirRequest, moveRequest, writeRequest,
    copyRequest, newFileRequest, deleteRequest, renameViewRequest } from './requests';

export type ModFuncs = {
    writeFile: ActionFunc;
    duplicateFile: ActionFunc;
    deleteFile: ActionFunc;
    moveFile: (f: File, newPath: string) => void;
    renameFile: (oldPath: string, f: File) => void;
    copyToTarget: ActionFunc;
    moveToTarget: ActionFunc;
}

export type ActionFunc = (f: File) => void;

type MainViewProps = {
    path: string;
    files: File[];
    sorted: boolean;
    setMain: (main: Main) => void;
    setErr: (err: errObj) => void;
}

function MainView({path, files, sorted, setMain, setErr}: MainViewProps) {
    let { targets } = useContext(TargetsContext);

    const history = useHistory();

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

        update(insertNewDir(files.slice(), dirPath), sorted);
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
        update(files.slice(), sorted);
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
        const f = createNewFileObject(path);
        const newFiles = insertNewFile(files.slice(), f, sorted);

        update(newFiles, sorted);
        newFileRequest(f.path, setErr);
        history.push(f.path);
    }

    async function saveSort(part: File[], type: string) {
        const New = merge(files.slice(), part, type);
        update(New, true);
    }

    const modFuncs: ModFuncs = {
        writeFile:      writeFile,
        deleteFile:     deleteFile,
        moveFile:       moveFile,
        renameFile:     renameFile,
        duplicateFile:  duplicateFile,
        copyToTarget:   copyToTarget,
        moveToTarget:   moveToTarget
    }

    const Head = () => {
        return (
            <>
                <h1 className="name">
                <Link className="parent" to={dirname(path)}>^</Link>
                <RenameInput path={path} renameView={renameView} />
                </h1>
            </>
        )
    }

    /* file view */

    if (isText(path)) {
        if (!files || files.length === 0) {
            return <>No files found.</>;
        }

        const name = basename(path);
        const text = files.find(f => f.name === name);

        if (!text) {
            return <>{'Couldn’t find text: ' + name + '.'}</>
        }

        return (
            <>
            <Head />
            <Text file={text} modFuncs={modFuncs} isSingle={true} />
            </>
        )
    }

    /* dir view */

    return (
        <>
            <Head />
            <nav id="dirs">
                <DirList  dirs={dirsOnly(files)} saveSort={saveSort} />
                <AddDir submitFn={addNewDir} />
            </nav>
            <section id="files">
                <AddText newFn={createNewFile} />
                <FileList files={filesOnly(files)} modFuncs={modFuncs} saveSort={saveSort} />
            </section>
        </>
    )
}

export default MainView;


/* additional funcs */

function insertDuplicateFile(files: File[], f: File, newFile: File, isSorted: boolean) {
    if (isSorted) {
        return insertBefore(files, f, newFile);
    }
    return orgSort(files.concat(newFile));
}

function insertNewFile(files: File[], f: File, isSorted: boolean): File[] {
    if (!isSorted) {
        return [f].concat(files)
    }
    return orgSort(files.concat(f))
}

function createNewFileObject(path: string): File {
    const name = newTimestamp() + ".txt";
    return {
        id: Date.now(),
        name: name,
        path: join(path, name),
        type: "text",
        body: ""
    }
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

function AddText({newFn}: {newFn: () => void}) {
    return <button onClick={newFn}><NewTextIcon /></button>
}

function insertNewDir(files: File[], path: string): File[] {
    let f = {
        id:   Date.now(),
        name: basename(path),
        path: path,
        type: "dir",
        body: ""
    }
    return files.concat(f)
}

