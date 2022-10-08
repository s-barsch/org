import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/ClearSharp';
import EditIcon from '@material-ui/icons/Edit';
import { basename, dirname, join } from 'path';
import File from 'funcs/files';
import { modFuncsObj } from 'components/view/main';
import { copyRequest } from '../requests';
import { ErrContext } from 'context/err';
import { TargetsContext } from 'context/targets';

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

type PubButtonProps = {
    file: File;
    copyFile: (f: File, newPath: string) => void;
}

export function PubButton({file, copyFile}: PubButtonProps) {
    const i = file.path.indexOf("/private/")

    if (i < 0 ) {
        return null;
    };


    const move = () => {
        const publicPath = file.path.replace("/private", "/public/");
        copyFile(file, publicPath);
        return;
    }

    return <button className="info__bot" onClick={move}>pub</button>
}


type MetaProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSearch?: boolean;
}

export function Meta({file, modFuncs, isSearch}: MetaProps) {
    let { setErr } = useContext(ErrContext);
    let { targets } = useContext(TargetsContext);

    function copyFile(f: File, newPath: string) {
        copyRequest(f.path, newPath, setErr);
    }

    function moveToTarget() {
        modFuncs.moveToTarget(file);
    }

    function copyToTarget() {
        copyFile(file, join(targets.active, file.name));
    }

    function duplicateFile() {
        modFuncs.duplicateFile(file);
    }

    return (
        <div className="info">
            <FileName file={file} modFuncs={modFuncs} isSearch={isSearch} />
            <BotToggle file={file} moveFile={modFuncs.moveFile} />
            <button className="info__dupli" onClick={duplicateFile}>⧺</button>
            <button onClick={copyToTarget}><img className="rarr" alt="Copy" src="/rarrc.svg"/></button>
            <button onClick={moveToTarget}><img className="rarr" alt="Move" src="/rarr.svg"/></button>
            <PubButton file={file} copyFile={copyFile} />
            <span className="info__drag"></span>
            <span className="info__del">
                <Del file={file} deleteFile={modFuncs.deleteFile} />
            </span>
        </div>
    )
}

function FileName({file, modFuncs, isSearch}: MetaProps) {
    if (isSearch) {
        return <FileNamePlain file={file} modFuncs={modFuncs} />
    }
    return <FileNameEdit file={file} modFuncs={modFuncs} />
}

function FileNamePlain({file, modFuncs}: MetaProps) {
    return <FileLink file={file} isEdit={false}><span className="info__name">{file.name}</span></FileLink>
}

function FileNameEdit({file, modFuncs}: MetaProps) {
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
        { isEdit ? children : <Link className="info__name" to={file.path}>{children}</Link> }
        </>
    )
}

type DelProps = {
    file: File;
    deleteFile: (f: File) => void;
}

export function Del({file, deleteFile}: DelProps) {
    const del = () => {
        if (window.confirm("Delete this " + file.name + "?")) {
            deleteFile(file);
        }
    }
    return <button className="del" onClick={del}><DeleteIcon /></button>
}
