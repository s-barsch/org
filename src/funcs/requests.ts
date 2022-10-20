import File, { makeStringArr } from 'funcs/files';
import { errObj } from 'context/err';

type setErrFn = (err: errObj) => void;

export type reqOptions = {
    method: string;
    body:   string;
}

export function request(path: string, options: reqOptions, fnName: string, setErr: setErrFn): Promise<string> {
    let err = {
        func: fnName,
        path: path,
        code: 0,
        msg:  ''
    }
    return new Promise(async (resolve, reject) => {
        const resp = await fetch(path, options);
        const text = await resp.text();
        if (!resp.ok) {
            err.code = resp.status;
            if (err.code === 502) {
                err.msg = 'Server not running.';
            } else {
                err.msg = text;
            }
            setErr(err);
            reject(err);
            return;
        }
        err.code = 200;
        setErr(err);
        resolve(text);
    })
}

export async function moveRequest(path: string, newPath: string, setErr: setErrFn): Promise<string> {
    return request("/api/move" + path, {
        method: "POST",
        body: newPath
    }, 'moveRequest', setErr);
}

export async function copyRequest(path: string, newPath: string, setErr: setErrFn) {
    await request("/api/copy" + path, {
        method: "POST",
        body: newPath
    }, 'copyRequest', setErr);
}

export function writeRequest(path: string, body: string, setErr: setErrFn) {
    return request("/api/write" + path, {
        method: "POST",
        body:   body
    }, 'writeRequest', setErr);
}

export function deleteRequest(path: string, setErr: setErrFn) {
    return request("/api/delete" + path, {} as reqOptions, 'deleteRequest', setErr);
}

export function newDirRequest(path: string, setErr: setErrFn) {
    return request("/api/write" + path, {} as reqOptions, 'newDirRequest', setErr);
}

export function saveSortRequest(path: string, files: File[], setErr: setErrFn) {
    return request("/api/sort" + path, {
        method: "POST",
        body: JSON.stringify(makeStringArr(files))
    }, 'saveSortRequest', setErr);
}

export function newFileRequest(path: string, setErr: setErrFn) {
    return request("/api/write" + path, {
            method: "POST",
            body: "newfile"
    }, 'newFileRequest', setErr);
}

