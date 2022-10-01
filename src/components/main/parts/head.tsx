import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dirname } from 'path';
import { orgBase } from 'funcs/paths';
type HeadProps = {
    path: string;
    renameFn: (name: string) => void;
}

export default function Head({path, renameFn}: HeadProps) {
    return (
        <h1 className="name">
        <Link className="parent" to={dirname(path)}>^</Link>
        <Rename path={path} renameFn={renameFn} />
        </h1>
    )
}

type RenameViewProps = {
    path: string;
    renameFn: (name: string) => void;
}

function Rename({path, renameFn}: RenameViewProps) {
    const [name, setName] = useState(orgBase(path));

    useEffect(() => {
        setName(orgBase(path));
    }, [path]);

    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function submit(e: React.FormEvent<HTMLInputElement>) {
        const old = orgBase(path);
        if (old === name || name === '') {
            return;
        }
        renameFn(name);
    }

    return (
        <input type="text" value={name} size={name.length}
        disabled={name === "org" ? true : false} 
        onChange={handleTyping} onBlur={submit} />
    )
}


