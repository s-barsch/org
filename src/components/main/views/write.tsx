import React from 'react';
import Head from 'components/main/parts/head';
import Text from 'components/main/files/text';
import { newTimestamp, timestampDir } from 'funcs/paths';
import File, { newFile } from 'funcs/files';

export default function New() {
    const text = newFile(getTodayPath());
    return (
        <>
            {/* <Nav pathname={path} nav={dir.nav} err={err} />*/}
            <Head path={text.path} renameFn={renameFn} />
            <Text file={text} writeText={(f: File) => {}} isSingle={true} />
        </>
    )
}

function renameFn(name: string) {
    return;
}

function getTodayPath(): string {
    const ts = newTimestamp();
    const tsDir = timestampDir(ts);
    return ["private/graph", tsDir, ts].join('');
}
