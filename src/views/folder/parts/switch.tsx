import React from 'react';
import { Meta } from 'parts/Meta';
import Text from 'views/folder/files/TextView';
import Image from 'views/folder/files/Image';
import Video from 'views/folder/files/Video';
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
