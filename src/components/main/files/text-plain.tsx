import React from 'react';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import File from 'funcs/files';
import { Meta } from 'components/main/files/meta';

type TextFieldProps = {
    file: File;
    mainFuncs?: mainFuncsObj;
    modFuncs: modFuncsObj;
    isSingle: boolean;
}

export default function TextField({file, modFuncs}: TextFieldProps) {
    return (
        <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
            <Meta file={file} modFuncs={modFuncs} isSearch={true} />
            <code className="text-field">{file.body}</code>
        </div>
    )
}

function isNoSort(name: string): boolean {
    switch (name) {
        case "info":
        case ".sort":
            return true;
        default:
            return false;
    }
}
