import File from './funcs/file';

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

type View = {
    path: string;
    nav: Nav;
    files: File[];
    sorted: boolean;
}

export default View;

export type Nav = {
    path: string;
    switcher: string;
    siblings: File[];
    Links: string[];
}
