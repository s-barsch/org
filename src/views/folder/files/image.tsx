import React from 'react';
import File from 'funcs/files';
import Info from './info';
import AddInfo from './extra/add-info';

type ImageProps = {
    file: File;
    isSingle?: boolean;
}

export default function Image({file, isSingle}: ImageProps) {
    if (isSingle) {
        return <img alt="" src={"/file" + file.path} />
    } else {
        return (
            <div className="list-media">
                <img alt="" src={"/file" + file.path} />
                <AddInfo mainFilePath={file.path}></AddInfo>
                <Info mainFilePath={file.path} />
            </div>
        )
    }
}
