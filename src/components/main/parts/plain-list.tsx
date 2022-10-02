import React, { useEffect, useState } from 'react';
import File from 'funcs/files';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { FileSwitch } from 'components/main/parts/switch-plain'

type FileListProps = {
    files: File[];
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export function FileList({files, mainFuncs, modFuncs}: FileListProps) {
    const [state, setState] = useState(files);

    useEffect(() => {
        setState(files);
    }, [files])

    if (!files || files.length === 0) {
        return null
    }
    // filter=".no-sort"
    return (
        <>
            {state.map((file, i) => (
                <FileSwitch key={file.id} file={file} mainFuncs={mainFuncs} modFuncs={modFuncs} isSingle={false} />
            ))}
        </>
    );
}

// DIR LIST NOT IMPLEMENTED