import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dirname, join } from 'path-browserify';
import { orgBase } from '../funcs/paths';
import useView from '../state';
import { UploadProgress } from './UploadProgress';
type HeadProps = {
    path: string;
    disabled?: boolean;
    isNew?: boolean;
    
}

export default function Head({path, isNew, disabled}: HeadProps) {
    return (
        <>
        <UploadProgress />
        <h1 className="name">
        <Link className="parent" to={dirname(path)}>^</Link>
        <IsNew isNew={isNew}>
            <Rename path={path} disabled={disabled} />
        </IsNew>
        </h1>
        </>
    )
}


function IsNew({ children, isNew }: {children: React.ReactNode, isNew?: boolean}) {
    if (isNew) {
        return <span className="nonexistent">{children}</span>;
    }
    return <>{children}</>;
}

function Rename({ path, disabled }: HeadProps) {
    const { renameView } = useView();
    const [name, setName] = useState(orgBase(path));
    const navigate = useNavigate();

    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
        const base = orgBase(path);
        setName(base);

        if (base === "search") {
            ref.current.focus({ preventScroll: true });
            ref.current.classList.add("search")
            setName('');
        }
    }, [path]);


    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function submit() {
        const old = orgBase(path);
        if (old === name || name === '') {
            return;
        }
        renameView(path, name);
        const newPath = join(dirname(path), name);
        navigate(newPath);
    }

    function detectEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            submit();
        }
    }

    let len = name.length === 0 ? 10 : name.length;

    return (
        <input type="text" value={name} size={len} name="head"
            ref={ref} disabled={name === "org" || disabled}
            onChange={handleTyping} onKeyDown={detectEnter} onBlur={submit} />
    )
}


