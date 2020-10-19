import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/ClearSharp';
import EditIcon from '@material-ui/icons/Edit';
import { basename, dirname, join } from 'path';
import File from '../funcs/file';
import { ModFuncs, ActionFunc } from '../types';

type BotToggleProps = {
    file: File;
    moveFile: (f: File, newPath: string) => void;
}

export function BotToggle({file, moveFile}: BotToggleProps) {
    const target = basename(dirname(file.path)) === "bot" ? "top" : "bot";

    const move = () => {
        const i = file.path.lastIndexOf("/")
        let newPath: string = "";

        if (target === "bot") {
            newPath = file.path.substr(0, i) + "/bot" + file.path.substr(i)
        }
        if (target === "top") {
            newPath = file.path.substr(0, i-4) + file.path.substr(i);
        }

        moveFile(file, newPath);
        return;
    }

    return <button className="info__bot" onClick={move}>{target}</button>
}

type InfoProps = {
    file: File;
    modFuncs: ModFuncs;
}

export function Info({file, modFuncs}: InfoProps) {

    function moveToTarget(evt: React.MouseEvent<HTMLButtonElement>) {
        modFuncs.moveToTarget(file);
    }

    function copyToTarget(evt: React.MouseEvent<HTMLButtonElement>) {
        modFuncs.copyToTarget(file);
    }

    function duplicateFile(evt: React.MouseEvent<HTMLButtonElement>) {
        modFuncs.duplicateFile(file);
    }

    return (
        <div className="info">
            <FileName file={file} modFuncs={modFuncs} />
            <BotToggle file={file} moveFile={modFuncs.moveFile} />
            <button className="info__dupli" onClick={duplicateFile}>⧺</button>
            <button onClick={copyToTarget}><img className="rarr" alt="Copy" src="/rarrc.svg"/></button>
            <button onClick={moveToTarget}><img className="rarr" alt="Move" src="/rarr.svg"/></button>
            <span className="info__drag"></span>
            <span className="info__del">
                <Del file={file} deleteFile={modFuncs.deleteFile} />
            </span>
        </div>
    )
}

function FileName({file, modFuncs}: InfoProps) {
    const [edit, setEdit] = useState(false);

    const [name, setName] = useState("");

    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (!file) {
            return;
        }
        setName(file.name);
    }, [file]);

    useEffect(() => {
        if (edit && ref && ref.current) {
            ref.current.focus({preventScroll:true})
        }
    }, [edit]);


    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function toggleEdit(e: React.MouseEvent<HTMLButtonElement>) {
        setEdit(!edit);
    }

    function rename(e: React.FormEvent<HTMLInputElement>) {
        setEdit(false);
        if (name === file.name) {
            return;
        }
        const oldPath = file.path;
        file.path = join(dirname(file.path), name);
        file.name = name;
        modFuncs.renameFile(oldPath, file);
    }

    return (
        <span className="info__file">
        <FileLink file={file} isEdit={edit}>
            <input
                disabled={edit ? false : true} size={name.length}
                value={name} className="info__rename"
                onChange={handleTyping} ref={ref} onBlur={rename}
            />
        </FileLink>
        <button onClick={toggleEdit} className="info__edit"><EditIcon /></button>
        <span className="info__type">{file.type}</span>
        </span>
    )
}

type FileLinkProps = {
    file: File;
    isEdit: boolean;
    children: React.ReactNode;
}

function FileLink({file, isEdit, children}: FileLinkProps) {
    return (
        <>
            isEdit ? children : <Link className="info__name" to={file.path}>{children}</Link>
        </>
    )
}

type DelProps = {
    file: File;
    deleteFile: ActionFunc;
}

export function Del({file, deleteFile}: DelProps) {
    const del = () => {
        if (window.confirm("Delete this " + file.type + "?")) {
            deleteFile(file);
        }
    }
    return <button className="del" onClick={del}><DeleteIcon /></button>
}
