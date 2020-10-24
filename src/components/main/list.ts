import { extname, dirname } from 'path';
import File from '../../funcs/file';

export type SplitName = {
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

export function removeFromArr(files: File[], name: string): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === name) {
            files.splice(i, 1)
            return files;
        }
    }
    throw new Error("Could not delete " + name + "from files.");
}

export function insertBefore(files: File[], f: File, newFile: File): File[] {
    for (let i = 0; i < files.length; i++) {
        if (files[i].name === f.name) {
            files.splice(i, 0, newFile)
            return files;
        }
    }
    throw new Error('Could not insert before file: ' + f.name);
}

export function createDuplicate(file: File, files: File[]): File {
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

    throw new Error("Couldn’t create duplicate. No free name available.");
}


