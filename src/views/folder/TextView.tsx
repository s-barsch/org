import Head from '../../parts/Head';
import TextField from '../../views/folder/files/TextView';
import File, { newFile } from '../../funcs/files';

import { basename } from 'path-browserify';

type TextViewProps = {
    path: string;
    files: File[];
}

export default function TextView({path, files}: TextViewProps) {
    let { text, isNew } = findText(files, path);
    return (
        <>
            <Head path={path} isNew={isNew} disabled={isNew} />
            <TextField file={text} isSingle={true} />
        </>
    )
}

function findText(files: File[], path: string): { text: File; isNew: boolean; } {
    const f = newFile(path)
    if (!files || files.length === 0) {
        return { text: f, isNew: true }
    }

    const name = basename(path);
    const text = files.find(f => f.name === name);

    if (!text) {
        return { text: f, isNew: true }
    }
    return { text: text, isNew: false }
    /*
    if (!text) {
        return <>{'Couldn’t find text: ' + name + '.'}</>
    }
    */
}