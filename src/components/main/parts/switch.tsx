import React from 'react';
import { Meta } from 'components/main/files/meta';
import Text from 'components/main/files/text';
import Image from 'components/main/files/image';
import Video from 'components/main/files/video';
import File from 'funcs/files';
import { modFuncsObj } from 'components/main/main';

export type FileSwitchProps = {
    file: File;
    modFuncs: modFuncsObj;
    createNewFile: () => void;
    isSingle: boolean;
}

export function FileSwitch({file, modFuncs, createNewFile, isSingle}: FileSwitchProps) {
    /*
  if (file.name === ".sort") {
    return <div className="no-sort"><Meta file={file} modFuncs={modFuncs} /></div>
  }
     */
    switch (file.type) {
        case "text":
            return <Text file={file} createNewFile={createNewFile} modFuncs={modFuncs} isSingle={isSingle}/>
        case "image":
            return <Image file={file} modFuncs={modFuncs} />
        case "video":
            return <Video file={file} modFuncs={modFuncs} />
        default:
            return <Meta file={file} modFuncs={modFuncs} />
    }
}
