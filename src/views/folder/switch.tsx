import React from 'react';
import { Meta } from 'parts/meta/main';
import Text from 'views/folder/files/text';
import Image from 'views/folder/files/image';
import Video from 'views/folder/files/video';
import File from 'funcs/files';

export function FileSwitch({file, isSingle}: { file: File; isSingle: boolean }) {
    /*
  if (file.name === ".sort") {
    return <div className="no-sort"><Meta file={file} modFuncs={modFuncs} /></div>
  }
     */
    switch (file.type) {
        case "text":
            return <>
                <Text file={file} isSingle={isSingle} />
            </>
        case "image":
            return <Image file={file} />
        case "video":
            return <Video file={file} />
        default:
            return <Meta file={file} />
    }
}
