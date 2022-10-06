import React, { useContext } from 'react';
import Head from 'components/main/parts/head';
import TextField from 'components/main/files/text';
import { newTimestamp, timestampDir } from 'funcs/paths';
import File, { newFile } from 'funcs/files';
import Nav from 'components/nav/nav';
import { join } from 'path';
import { writeRequest } from 'components/main/requests';
import { useHistory } from 'react-router';
import { ErrContext } from 'context/err';

export default function New() {
    let { setErr } = useContext(ErrContext);
    const text = newFile(getTodayPath());
    const history = useHistory();

    async function writeFile(f: File) {
        await writeRequest(f.path, f.body, setErr);
        history.push(f.path)
    }

    return (
        <>
            <Nav path={text.path} />
            <Head path={text.path} disabled={true} renameFn={renameFn} />
            <TextField file={text} writeText={writeFile} isSingle={true} />
        </>
    )
}

function renameFn(name: string) {
    return;
}

function getTodayPath(): string {
    const ts = newTimestamp();
    const tsDir = timestampDir(ts);
    return join("/private/graph", tsDir);
}
