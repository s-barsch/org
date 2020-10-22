import React, { useEffect, useState } from 'react';
import { orgBase } from '../../funcs/paths';

type RenameInputProps = {
    path: string;
    renameView: (name: string) => void;
}

export default function RenameInput({path, renameView}: RenameInputProps) {
    const [name, setName] = useState(orgBase(path));

    useEffect(() => {
        setName(orgBase(path));
    }, [path]);

    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function submit(e: React.FormEvent<HTMLInputElement>) {
        const old = orgBase(path);
        if (old === name) {
            return;
        }
        renameView(name);
    }

    return (
        <input type="text" value={name} size={name.length}
        disabled={name === "org" ? true : false} 
        onChange={handleTyping} onBlur={submit} />
    )
}


