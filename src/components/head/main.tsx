import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { dirname } from 'path-browserify';
import { orgBase } from 'funcs/paths';
type HeadProps = {
    path: string;
    disabled?: boolean;
    isNew?: boolean;
    renameFn: (name: string) => void;
}

export default function Head({path, renameFn, isNew, disabled}: HeadProps) {
    return (
        <h1 className="name">
        <Link className="parent" to={dirname(path)}>^</Link>
        <IsNew isNew={isNew}>
            <Rename path={path} disabled={disabled} renameFn={renameFn} />
        </IsNew>
        </h1>
    )
}

function IsNew({ children, isNew }: {children: React.ReactNode, isNew?: boolean}) {
    if (isNew) {
        return <span className="nonexistent">{children}</span>;
    }
    return <>{children}</>;
}

function Rename({path, renameFn, disabled}: HeadProps) {
    const [name, setName] = useState(orgBase(path));

    const ref = useRef<HTMLInputElement>(null!)

    useEffect(() => {
        const base = orgBase(path);
        setName(base);

        if (base === "search") {
            ref.current.focus({ preventScroll: true });
            ref.current.classList.add("search-active")
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
        renameFn(name);
    }

    function detectEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            submit();
        }
    }

    return (
        <input type="text" value={name} size={name.length}
            ref={ref} disabled={name === "org" || disabled}
            onChange={handleTyping} onKeyPress={detectEnter} onBlur={submit} />
    )
}


