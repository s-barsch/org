import React from 'react';
import { Meta } from 'components/view/meta/main';
import Text from 'components/view/files/text';
import Image from 'components/view/files/image';
import Video from 'components/view/files/video';
import File from 'funcs/files';
import { modFuncsObj } from 'components/view/main';

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
            return <>
                <Text file={file} createNewText={createNewFile} writeText={modFuncs.writeFile} isSingle={isSingle} />
            </>
        case "image":
            return <Image file={file} modFuncs={modFuncs} />
        case "video":
            return <Video file={file} modFuncs={modFuncs} />
        default:
            return <Meta file={file} modFuncs={modFuncs} />
    }
}