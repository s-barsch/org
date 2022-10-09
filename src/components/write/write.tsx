import React, { useContext } from 'react';
import Head from 'components/head/main';
import TextField from 'components/view/files/text';
import { newTimestamp, timestampDir } from 'funcs/paths';
import File, { newFileDir } from 'funcs/files';
import Nav from 'components/nav/main';
import { join } from 'path';
import { writeRequest } from 'funcs/requests';
import { ErrContext } from 'context/err';
import { useNavigate } from 'react-router';
import { errObj } from 'context/err';

export default function New() {
    let { setErr } = useContext(ErrContext);
    const text = newFileDir(getTodayPath());
    const navigate = useNavigate();

    function handleErr(err: errObj) {
        if (err.code !== 200) {
            setErr(err)
            return;
        }
    }

    async function writeFile(f: File) {
        await writeRequest(f.path, f.body, handleErr);
        navigate(f.path)
    }

    return (
        <>
            <Nav path={text.path} />
            <Head path={text.path} disabled={true} renameFn={(name: string) => {}} />
            <TextField file={text} writeText={writeFile} isSingle={true} />
        </>
    )
}

function getTodayPath(): string {
    const ts = newTimestamp();
    const tsDir = timestampDir(ts);
    return join("/private/graph", tsDir);
}
