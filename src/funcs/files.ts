import { isTimestamp, dateToTimestamp, newTimestamp, timestampToDate } from './paths';
import { basename, extname, dirname, join } from 'path-browserify';
import { isOrdered, orgSort } from './sort';

type File = {
    id: number;
    path: string;
    name: string;
    type: string;
    body: string;
}

export default File;

export function newInfoFile(mainFilePath: string): File {
    const path = mainFilePath + ".info"

    return {
        id: Date.now(),
        path: path,
        name: basename(path),
        type: "info",
        body: ""
    }
}

export function newTextFile(path: string): File {
    return {
        id: Date.now(),
        name: basename(path),
        path: path,
        type: "text",
        body: ""
    }
}

export function newFileDir(path: string): File {
    const name = newTimestamp() + ".txt";
    return {
        id: Date.now(),
        name: name,
        path: join(path, name),
        type: "text",
        body: ""
    }
}

export type SplitName = {
    trunk: string;
    ext: string;
}

// 120912+2.txt -> 120912.txt
function splitName(name: string): SplitName {
    let ext = extname(name);
    let trunk = name.substr(0, name.length - ext.length);

    const x = trunk.indexOf("+");
    if (x >= 0) {
        trunk = trunk.substr(0, x);
    }
    return {
        trunk: trunk,
        ext: ext
    }
}

export function isPresentPath(files: File[], path: string): boolean {
    for (const f of files) {
        if (f.path === path) {
            return true
        }
    }
    return false
}

export function isPresent(files: File[], name: string): boolean {
    for (const f of files) {
        if (f.name === name) {
            return true
        }
    }
    return false
}


export function dirsOnly(list: File[]): File[] {
    if (!list) {
        return [];
    }
    return list.filter((file) => {
        return file.type === "dir"
    })
}

export function filesOnly(list: File[]): File[] {
    if (!list) {
        return [];
    }
    return list.filter((file) => {
        return file.type !== "dir"
    })
}

export function makeStringArr(files: File[]): string[] {
    let arr = [];
    for (const f of files) {
        arr.push(f.name);
    }
    return arr
}

export function merge(all: File[], part: File[], type: string): File[] {
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

export function removeFile(files: File[], name: string): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === name) {
            files.splice(i, 1)
            return files;
        }
    }
    throw new Error("Could not delete " + name + "from files.");
}

export function replaceFile(files: File[], oldFile: File, newFile: File): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === oldFile.name) {
            files.splice(i, 1, newFile)
            return files;
        }
    }

    throw new Error('Could not replace file: ' + oldFile.name);
}

export function insertBefore(files: File[], f: File, newF: File): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === f.name) {
            files.splice(i, 0, newF)
            return files;
        }
    }
    throw new Error('Could not insert before file: ' + f.name);
}

export function createDuplicate(file: File, files: File[]): File {
    let f = Object.assign({}, file);

    let name = splitName(f.name);
    if (isTimestamp(f.name)) {
        const d = timestampToDate(f.name);
        d.setSeconds(d.getSeconds() + 10);
        const newName = dateToTimestamp(d) + name.ext;
        if (!isPresent(files, newName)) {
            f.id = d.getTime();
            f.name = newName;
            f.path = dirname(f.path )+ '/' + newName;
            return f;
        }
    }
    for (let i = 1; i < 10; i++) {
        const newName = name.trunk + "+" + i + name.ext;
        if (!isPresent(files, newName)) {
            f.id = Date.now();
            f.name = newName;
            f.path = dirname(f.path) + "/" + newName;
            return f;
        }
    }

    throw new Error("Couldn’t create duplicate. No free name available.");
}


export function insertDuplicateFile(files: File[], file: File, duplicate: File) {
    if (isOrdered(files)) {
        return insertBefore(files, file, duplicate);
    }
    return orgSort(files.concat(duplicate));
}

export function insertNewFile(files: File[], f: File): File[] {
    if (isOrdered(files)) {
        return [f].concat(files)
    }

    return orgSort(files.concat(f))
}

export function updateFile(files: File[], f: File): File[] {
    const oldFile = files.find(x => x.name === f.name)
    if (oldFile) {
        return replaceFile(files, oldFile, f);
    }

    return insertNewFile(files, f);
}

export function renameText(files: File[], oldName: string, newName: string): File[] {
    const f = files.find(f => f.name === oldName);
    if (!f) {
        throw new Error("renameFile: Couldn’t find file. " + oldName)
    }

    f.path = join(dirname(f.path), newName);
    f.name = newName;

    return files
}

export function insertNewDir(files: File[], path: string, isSorted: boolean): File[] {
    let f = {
        id: Date.now(),
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

