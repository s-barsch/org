import React, { useEffect, useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AddDir from 'components/main/add';
import Text from 'components/types/text';
import NewTextIcon from '@material-ui/icons/Flare';
import { TargetsContext } from 'context/targets';
import { basename, dirname, join } from 'path';
import { newTimestamp, isText } from 'funcs/paths';
import { orgSort } from 'funcs/sort';
import File from 'funcs/file';
import { DirList, FileList } from 'components/main/files';
import RenameInput from 'components/main/rename';
import { Main } from 'app';
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

type FileViewProps = {
    pathname: string;
    main: Main;
    setMain: (main: Main) => void;
}

function MainView({pathname, main, setMain}: FileViewProps) {
    let { targets } = useContext(TargetsContext);

    const [path, setPath] = useState(pathname);
    const [files, setFiles] = useState([] as File[]);
    const [sorted, setSorted] = useState(false);

    useEffect(() => {
        setPath(pathname);
        setSorted(main.sorted);
        setFiles(main.files);
    }, [pathname, main])

    const history = useHistory();

    function update(newFiles: File[], isSorted: boolean) {
        setSorted(isSorted);
        setFiles(newFiles);

        setMain({
            sorted: isSorted,
            files:  newFiles
        });

        if (isSorted) {
            saveSortRequest(path, files)
        }
    }

    function addNewDir(name: string) {
        if (isPresent(files, name)) {
            alert("Dir with this name already exists.");
            return;
        }

        const dirPath = join(path, name);

        update(insertNewDir(files.slice(), dirPath), sorted);
        makeNewDirRequest(dirPath);
    }

    function writeFile(f: File) {
        makeWriteRequest(f.path, f.body);
    }

    async function renameView(newName: string) {
        let oldName = basename(path);
        let newPath = join(dirname(path), newName);

        if (isText(pathname)) {
            const newFiles = renameText(files.slice(), oldName, newName)
            update(newFiles, sorted);
        }

        await renameViewRequest(path, newPath)
        history.push(newPath);
    }

    function renameFile(oldPath: string, f: File) {
        update(files.slice(), sorted);
        makeMoveRequest(oldPath, f.path);
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
        makeWriteRequest(newFile.path, newFile.body)
    }

    function copyFile(f: File, newPath: string) {
        makeCopyRequest(f.path, newPath);
    }

    function moveFile(f: File, newPath: string) {
        setFiles(removeFromArr(files.slice(), f.name));
        makeMoveRequest(f.path, newPath);
    }

    function copyToTarget(f: File) {
        copyFile(f, join(targets.active, f.name));
    }

    function moveToTarget(f: File) {
        moveFile(f, join(targets.active, f.name));
    }

    function deleteFile(f: File) {
        if (f.name === ".sort") {
            setSorted(false);
        }
        setFiles(removeFromArr(files.slice(), f.name));
        makeDeleteRequest(f.path);
    }

    function createNewFile() {
        const f = createNewFileObject(pathname);
        const newFiles = insertNewFile(files.slice(), f, sorted);

        update(newFiles, sorted);
        makeNewFileRequest(f.path)
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
            <h1 className="name">
            <Link className="parent" to={dirname(pathname)}>^</Link>
            <RenameInput path={pathname} renameView={renameView} />
            </h1>
        )
    }

    console.log(files);

    /* file view */

    if (isText(pathname)) {
        if (!files || files.length === 0) {
            return <>No files found.</>;
        }

        const name = basename(pathname);
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

type reqOptions = {
    method: string;
    body:   string;
}

async function request(path: string, options?: reqOptions, callback?: () => void) {
    try {
        const resp = await fetch(path, options);
        if (!resp.ok) {
            const text = await resp.text();
            console.log("fetch failed: " + path + "\nreason: " + text);
            return;
        }
        if (callback) {
            callback();
        }
    } catch(err) {
        console.log(err)
    }
}

function makeMoveRequest(path: string, newPath: string) {
    request("/api/move" + path, {
        method: "POST",
        body: newPath
    },
        function callBack() {
            setWriteTime();
        }
    );
}

function makeCopyRequest(path: string, newPath: string) {
    request("/api/copy" + path, {
        method: "POST",
        body: newPath
    },
        function callBack() {
            setWriteTime();
        }
    );
}

function insertDuplicateFile(files: File[], f: File, isSorted: boolean) {
    if (isSorted) {
        return insert(files, f, f);
    }
    return files.concat(f);
}

function makeWriteRequest(path: string, body: string) {
    request("/api/write" + path, {
        method: "POST",
        body:   body
    });
}

function makeDeleteRequest(path: string) {
    request("/api/delete" + path);
}

function makeNewDirRequest(path: string) {
    request("/api/write" + path);
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

function renameViewRequest(path: string, body: string) {
    request("/api/move" + path, {
        method: "POST",
        body: body
    });
}

function saveSortRequest(path: string, files: File[]) {
    request("/api/sort" + path, {
        method: "POST",
        body: JSON.stringify(makeStringArr(files))
    });
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

function insertNewFile(files: File[], f: File, isSorted: boolean): File[] {
    if (!isSorted) {
        return [f].concat(files)
    }
    return orgSort(files.concat(f))
}

function makeNewFileRequest(path: string) {
    request("/api/write" + path, {
            method: "POST",
            body: "newfile"
    });
}
