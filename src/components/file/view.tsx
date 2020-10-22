import React, { useEffect, useState, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import AddDir from './add';
import Text from '../types/text';
import NewTextIcon from '@material-ui/icons/Flare';
import { DirList, FileList } from './files';
import { TargetsContext } from '../../targets';
import { basename, extname, dirname, join } from 'path';
import { newTimestamp, isText, orgBase } from '../../funcs/paths';
import { separate, orgSort } from '../../funcs/sort';
import File from '../../funcs/file';
import View, { ModFuncs } from '../../types';

function newMockFile(i: number): File {
    const name = newTimestamp() + "+" + i + ".txt";
    return {
        id:   i,
        path: "/sample/" + name,
        name: name,
        type: "text",
        body: ""
    }
}

function mockFiles(): File[] {
    let arr: File[] = [];
    for (let i = 0; i <= 2; i++) {
        arr.push(newMockFile(i));
    }
    return arr
}

type FileViewProps = {
    pathname: string;
    view: View;
    setView: (v: View) => void;
}

function FileView({pathname, view, setView}: FileViewProps) {
    let { targets } = useContext(TargetsContext);

    const [path, setPath] = useState(pathname);
    const [files, setFiles] = useState(mockFiles());
    const [sorted, setSorted] = useState(false);

    useEffect(() => {
        setPath(pathname);
        setSorted(view.sorted);
        setFiles(view.files);
    }, [pathname, view])

    const history = useHistory();

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

    function update(newFiles: File[], isSorted: boolean) {
        if (isSorted === undefined) {
            alert('invalid sorted attribute.');
        }

        if (!isSorted) {
            newFiles = orgSort(newFiles);
        }

        setFiles(newFiles);
        setSorted(isSorted);

        view.files = newFiles;
        view.sorted = isSorted;
        setView(view);


        if (isSorted) {
            request("/api/sort" + path, {
                method: "POST",
                body: JSON.stringify(makeStringArr(newFiles))
            }, () => {});
        }
    }

    function addNewDir(name: string) {
        if (name === "") {
            return;
        }
        if (isPresent(files, name)) {
            alert("Dir with this name already exists.");
            return;
        }

        let f = {
            id:   Date.now(),
            name: name,
            body: "",
            path: join(path, name),
            type: "dir"
        }

        update(separate(files.slice().concat(f)), sorted)

        request("/api/write" + join(path, name));
    }

    function setWriteTime() {
        localStorage.setItem("write", String(Date.now()));
    }

    function writeFile(f: File) {
        request("/api/write" + f.path, {
            method: "POST",
            body:   f.body
        });
    }

    function renameView(newName: string) {
        let newPath = "";
        if (isText(pathname)) {
            const name = basename(path)
            const t = files.find(f => f.name === name);
            if (!t) {
                alert("rename: Couldn’t find text.")
                return
            }
            t.path = join(dirname(pathname), newName);
            t.name = newName;
            update(files.slice(), sorted);
            history.push(t.path);
            request("/api/move" + pathname, {
                method: "POST",
                body: t.path
            });
            return;
        }
        newPath = join(dirname(path), newName);
        request("/api/move" + pathname, {
            method: "POST",
            body: newPath
        }, function callback() {
            history.push(newPath);
        });
    }

    // doesn’t leave the directory.
    function renameFile(oldPath: string, f: File) {
        update(files.slice(), sorted);
        request("/api/move" + oldPath, {
            method: "POST",
            body: f.path
        });
    }

    function duplicateFile(f: File) {
        const newFile = createDuplicate(f, files);
        if (!newFile) {
            alert("Couldn’t create duplicate: no free name available.");
            return;
        }

        if (sorted) {
            update(insert(files.slice(), f, newFile), sorted);
        } else {
            update(files.slice().concat(newFile), sorted);
        }

        request("/api/write" + newFile.path, {
            method: "POST",
            body: newFile.body
        });
    }

    function copyFile(f: File, newPath: string) {
        request("/api/copy" + f.path, {
            method: "POST",
            body: newPath
        },
            function callBack() {
                setWriteTime();
            }
        );
    }

    function moveFile(f: File, newPath: string) {
        setFiles(removeFromArr(files.slice(), f.name));
        request("/api/move" + f.path, {
            method: "POST",
            body: newPath
        },
            function callBack() {
                setWriteTime();
            }
        );
    }

    function copyToTarget(f: File) {
        copyFile(f, join(targets.active, f.name));
    }

    function moveToTarget(f: File) {
        moveFile(f, join(targets.active, f.name));
    }

    function deleteFile(f: File) {
        setFiles(removeFromArr(files.slice(), f.name));
        if (f.name === ".sort") {
            setSorted(false);
        }
        request("/api/delete" + f.path)
    }

    const createNewFile = () => {
        const name = newTimestamp() + ".txt";
        const f = {
            id: Date.now(),
            name: name,
            path: path + (path === "/" ? "" : "/") + name,
            type: "text",
            body: ""
        }

        update(separate(files.slice().concat(f)), sorted);

        request("/api/write" + f.path,
            {
                method: "POST",
                body: "newfile"
            },
            function callBack() {
                history.push(f.path)
            }
        )
    }

    async function saveSort(part: File[], type: string) {
        setSorted(true);
        const New = merge(files.slice(), part, type);
        update(New, true);
    }

    const modFuncs: ModFuncs = {
        writeFile: writeFile,
        duplicateFile: duplicateFile,
        deleteFile: deleteFile,
        moveFile: moveFile,
        renameFile: renameFile,
        copyToTarget: copyToTarget,
        moveToTarget: moveToTarget
    }

    const Head = () => {
        return (
            <h1 className="name">
            <Link className="parent" to={dirname(pathname)}>^</Link>
            <RenameInput path={pathname} renameView={renameView} />
            </h1>
        )
    }

    if (isText(pathname)) {
        if (!files || files.length === 0) {
            return <></>;
        }

        const name = basename(pathname);
        const text = files.find(f => f.name === name);

        if (!text) {
            return <>"Couldn’t find text."</>
        }

        return (
            <>
            <Head />
            <Text file={text} modFuncs={modFuncs} isSingle={true} />
            </>
        )
    }

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

function AddText({newFn}: {newFn: () => void}) {
    return <button onClick={newFn}><NewTextIcon /></button>
}

export default FileView;

function dirsOnly(list: File[]): File[] {
    if (!list) {
        return [];
    }
    return list.filter((file) => {
        return file.type === "dir"
    })
}

function filesOnly(list: File[]): File[] {
    if (!list) {
        return [];
    }
    return list.filter((file) => {
        return file.type !== "dir"
    })
}

function makeStringArr(files: File[]): string[] {
    let arr = [];
    for (const f of files) {
        arr.push(f.name);
    }
    return arr
}

function merge(all: File[], part: File[], type: string): File[] {
    let diff = subtract(all, part)
    if (type === "files") {
        return diff.concat(part)
    } 
    return part.concat(diff)
}

function subtract(base: File[], other: File[]): File[] {
    for (const f of other) {
        for (let i = 0; i < base.length; i++) {
            if (base[i].name === f.name) {
                base.splice(i, 1)
                break;
            }
        }
    }
    return base
}

function removeFromArr(files: File[], name: string): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === name) {
            files.splice(i, 1)
            break;
        }
    }
    return files;
}

function insert(files: File[], f: File, newFile: File): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === f.name) {
            files.splice(i, 0, newFile)
            return files;
        }
    }
    alert("Couldn’t insert duplicate.");
    return files;
}

function createDuplicate(file: File, files: File[]): File | undefined {
    let f = Object.assign({}, file);

    let name = splitName(f.name);
    for (let i = 1; i < 10; i++) {
        const newName = name.trunk + "+" + i + name.ext; 
        if (!isPresent(files, newName)) {
            f.id = Date.now();
            f.name = newName;
            f.path = dirname(f.path) + "/" + newName;
            return f;
        }
    }
    return;
}

type SplitName = {
    trunk: string;
    ext: string;
}

// 120912+2.txt -> 120912.txt
function splitName(name: string): SplitName {
    let ext = extname(name);
    let trunk = name.substr(0, name.length-ext.length);

    const x = trunk.indexOf("+");
    if (x >= 0) {
        trunk = trunk.substr(0, x);
    }
    return {
        trunk: trunk,
        ext: ext
    }
}

function isPresent(files: File[], name: string): boolean {
    for (const f of files) {
        if (f.name === name) {
            return true
        }
    }
    return false
}

type RenameInputProps = {
    path: string;
    renameView: (name: string) => void;
}

function RenameInput({path, renameView}: RenameInputProps) {
    const [name, setName] = useState(orgBase(path));

    useEffect(() => {
        setName(orgBase(path));
    }, [path]);

    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function submit(e: React.FormEvent<HTMLInputElement>) {
        const old = orgBase(path);
        if (old === name) {
            return;
        }
        renameView(name);
    }

    return (
        <input type="text" value={name} size={name.length}
        disabled={name === "org" ? true : false} 
        onChange={handleTyping} onBlur={submit} />
    )
}


