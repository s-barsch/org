import File, { makeStringArr } from 'funcs/files';
import { errObj } from 'app';

type setErrFn = (err: errObj) => void;

type reqOptions = {
    method: string;
    body:   string;
}

function setWriteTime() {
    localStorage.setItem("write", String(Date.now()));
}

function request(path: string, options: reqOptions, err: errObj, setErr: setErrFn): Promise<string> {
    return new Promise(async (resolve, reject) => {
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
        resolve("");
    });
}

export async function moveRequest(path: string, newPath: string, setErr: setErrFn) {
    let e = {
        func: 'moveRequest',
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

export async function copyRequest(path: string, newPath: string, setErr: setErrFn) {
    let e = {
        func: 'copyRequest',
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

export function writeRequest(path: string, body: string, setErr: setErrFn) {
    let e = {
        func: 'writeRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {
        method: "POST",
        body:   body
    }, e, setErr);
}

export function deleteRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'deleteRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/delete" + path, {} as reqOptions, e, setErr);
}

export function newDirRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'newDirRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {} as reqOptions, e, setErr);
}

export function renameViewRequest(path: string, body: string, setErr: setErrFn): Promise<string> {
    let e = {
        func: 'viewRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    return request("/api/move" + path, {
        method: "POST",
        body: body
    }, e, setErr);
}

export function saveSortRequest(path: string, files: File[], setErr: setErrFn) {
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

export function newFileRequest(path: string, setErr: setErrFn) {
    let e = {
        func: 'newFileRequest',
        path: path,
        code: 0,
        msg:  ''
    }
    request("/api/write" + path, {
            method: "POST",
            body: "newfile"
    }, e, setErr);
}

