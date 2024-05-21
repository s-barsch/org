import React from 'react';

import Head from 'parts/head/main';
import File from 'funcs/files';
import Image from '../files/image';
import Video from '../files/video';

import { basename } from 'path-browserify';

type TextViewProps = {
    path: string;
    files: File[];
}

export default function MediaView({path, files}: TextViewProps) {
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
            <Head path={path} />
            <Media file={media} isSingle={true} />
        </>
    )
}

type MediaProps = {
    file: File;
    isSingle: boolean;
}

export function Media({file, isSingle}: MediaProps) {
    switch (file.type) {
        case "image":
            return <Image file={file} isSingle={isSingle} />
        case "video":
            return <Video file={file} isSingle={isSingle} />
        default:
            return <>"Not implemented. (Media)."</>;
    }
}
