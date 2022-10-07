import React from 'react';
import File from 'funcs/files';
import { Link } from 'react-router-dom';

export function FileList({files}: {files: File[]}) {
    if (!files || files.length === 0) {
        return null
    }
    return (
        <>
            {files.map((file, i) => (
                <div key={file.id}>
                    <Meta file={file} />
                    <FileSwitch file={file} />
                </div>
            ))}
        </>
    );
}

export function FileSwitch({file}: {file: File}) {
    switch (file.type) {
        case 'text':
            return <Text file={file} />
        default:
            return <>{file.name}</>
    }
}

export function Meta({file}: {file: File}) {
    return <Link className="info__name" to={file.path}>{file.name}</Link>
}

export default function Text({file}: {file: File}) {
    return (
        <div className={"text"}>
            <code className="text-field">{file.body}</code>
        </div>
    )
}