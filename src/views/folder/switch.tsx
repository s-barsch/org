import React from 'react';
import { Meta } from 'parts/meta/main';
import Text from 'views/folder/files/text';
import Image from 'views/folder/files/image';
import Video from 'views/folder/files/video';
import File from 'funcs/files';
import { modFuncsObj } from 'views/folder/main';

export type FileSwitchProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSingle: boolean;
}

export function FileSwitch({file, modFuncs, isSingle}: FileSwitchProps) {
    /*
  if (file.name === ".sort") {
    return <div className="no-sort"><Meta file={file} modFuncs={modFuncs} /></div>
  }
     */
    switch (file.type) {
        case "text":
            return <>
                <Text file={file} createFile={modFuncs.createFile} writeText={modFuncs.writeFile} isSingle={isSingle} />
            </>
        case "image":
            return <Image file={file} modFuncs={modFuncs} />
        case "video":
            return <Video file={file} modFuncs={modFuncs} />
        default:
            return <Meta file={file} modFuncs={modFuncs} />
    }
}
