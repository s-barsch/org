import React from 'react';
import All from 'views/all/main';
import { fileType } from 'funcs/paths';
import File from 'funcs/files';
import TextView from 'views/folder/views/text';
import DirView from 'views/folder/views/dir';
import MediaView from './views/media';

type ViewProps = {
    path: string;
    files: File[];
    sorted: boolean;
}

export default function View({path, files }: ViewProps) {
    // let { setErr } = useContext(ErrContext);
    switch (fileType(path)) {
        case "text":
            return <TextView path={path} files={files} />;
        case "media":
            return <MediaView path={path} files={files} />;
        case "all":
            return <All path={path} files={files} />;
        default:
            return <DirView path={path} files={files} />
    }
}