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
import { filesOnly, dirsOnly, makeStringArr, merge, insert, 
    createDuplicate, isPresent, removeFromArr } from './list';

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
            saveSortRequest(path, files, setErr)
        }
    }

    function addNewDir(name: string) {
        if (isPresent(files, name)) {
            alert("Dir with this name already exists.");
            return;
        }

        const dirPath = join(path, name);

        update(insertNewDir(files.slice(), dirPath), sorted);
        makeNewDirRequest(dirPath, setErr);
    }

    function writeFile(f: File) {
        makeWriteRequest(f.path, f.body, setErr);
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
        makeMoveRequest(oldPath, f.path, setErr);
    }

    function duplicateFile(f: File) {
        let newFile: File;
        try {
            newFile = createDuplicate(f, files);
        } catch(err) {
            alert(err);
            return;
        }

        update(insertDuplicateFile(files.slice(), newFile, sorted), sorted);
        makeWriteRequest(newFile.path, newFile.body, setErr);
    }

    function copyFile(f: File, newPath: string) {
        makeCopyRequest(f.path, newPath, setErr);
    }

    function moveFile(f: File, newPath: string) {
        update(removeFromArr(files.slice(), f.name), sorted);
        makeMoveRequest(f.path, newPath, setErr);
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
        makeDeleteRequest(f.path, setErr);
    }

    function createNewFile() {
        const f = createNewFileObject(path);
        const newFiles = insertNewFile(files.slice(), f, sorted);

        update(newFiles, sorted);
        makeNewFileRequest(f.path, setErr);
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


/* request funcs */

type reqOptions = {
    method: string;
    body:   string;
}

type setErrFn = (err: errObj) => void;

function request(path: string, options: reqOptions, err: errObj, setErr: setErrFn): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await fetch(path, options);
            if (!resp.ok) {
                err.code = resp.status;
                if (err.code === 502) {
                    err.msg = 'Server not running.';
                } else {
                    err.msg = await resp.text();
                }
                setErr(err);
                reject(err);
                return;
            }
            err.code = 200;
            setErr(err);
            resolve();
        } catch(err) {
            console.log(err)
        }
    });
}

async function makeMoveRequest(path: string, newPath: string, setErr: setErrFn) {
    let e = {
        func: 'makeMoveRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    await request("/api/move" + path, {
        method: "POST",
        body: newPath
    }, e, setErr);
    setWriteTime();
}

async function makeCopyRequest(path: string, newPath: string, setErr: setErrFn) {
    let e = {
        func: 'makeCopyRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    await request("/api/copy" + path, {
        method: "POST",
        body: newPath
    }, e, setErr);
    setWriteTime();
}

function makeWriteRequest(path: string, body: string, setErr: setErrFn) {
    let e = {
        func: 'makeWriteRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {
        method: "POST",
        body:   body
    }, e, setErr);
}

function makeDeleteRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'makeDeleteRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/delete" + path, {} as reqOptions, e, setErr);
}

function makeNewDirRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'makeNewDirRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {} as reqOptions, e, setErr);
}

function renameViewRequest(path: string, body: string, setErr: setErrFn): Promise<string> {
    let e = {
        func: 'renameViewRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    return request("/api/move" + path, {
        method: "POST",
        body: body
    }, e, setErr);
}

function saveSortRequest(path: string, files: File[], setErr: setErrFn) {
    let e = {
        func: 'saveSortRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/sort" + path, {
        method: "POST",
        body: JSON.stringify(makeStringArr(files))
    }, e, setErr);
}

function makeNewFileRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'makeNewFileRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {
            method: "POST",
            body: "newfile"
    }, e, setErr);
}

/* additional funcs */

function insertDuplicateFile(files: File[], f: File, isSorted: boolean) {
    if (isSorted) {
        return insert(files, f, f);
    }
    return files.concat(f);
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

function setWriteTime() {
    localStorage.setItem("write", String(Date.now()));
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

