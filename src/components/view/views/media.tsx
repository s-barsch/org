import React from 'react';

import Head from 'components/head/main';
import File from 'funcs/files';
import Image from '../files/image';
import Video from '../files/video';

import { modFuncsObj } from 'components/view/main';
import { basename } from 'path-browserify';

type TextViewProps = {
    path: string;
    files: File[];
    renameView: (name: string) => void;
    modFuncs: modFuncsObj;
}

export default function MediaView({path, files, renameView, modFuncs}: TextViewProps) {
    if (!files || files.length === 0) {
        return <>No files. (MediaView)</>
    }

    const name = basename(path);
    const media = files.find(f => f.name === name);

    if (!media) {
        return <>Media not found. (MediaView)</>
    }
    return (
        <>
            <Head path={path} renameFn={renameView} />
            <Media file={media} modFuncs={modFuncs} isSingle={true} />
        </>
    )
}

type MediaProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSingle: boolean;
}

export function Media({file, modFuncs, isSingle}: MediaProps) {
    switch (file.type) {
        case "image":
            return <Image file={file} modFuncs={modFuncs} isSingle={isSingle} />
        case "video":
            return <Video file={file} modFuncs={modFuncs} isSingle={isSingle} />
        default:
            return <>"Not implemented. (Media)."</>;
    }
}
