import React, {useContext } from 'react';
import DeleteIcon from '@material-ui/icons/ClearSharp';
import { basename, dirname, join } from 'path';
import File from 'funcs/files';
import { modFuncsObj } from 'components/view/main';
import { copyRequest } from '../requests';
import { ErrContext } from 'context/err';
import { TargetsContext } from 'context/targets';
import FileName from './filename';


export function Meta({file, modFuncs}: {file: File, modFuncs: modFuncsObj}) {
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
            <FileName file={file} modFuncs={modFuncs} />
            <BotToggle file={file} moveFile={modFuncs.moveFile} />
            <DuplicateButton duplicateFile={duplicateFile} />
            <CopyButton copyToTarget={copyToTarget} />
            <MoveButton moveToTarget={moveToTarget} />
            <PubButton file={file} copyFile={copyFile} />
            <DragHandle />
            <span className="info__del">
                <Del file={file} deleteFile={modFuncs.deleteFile} />
            </span>
        </div>
    )
}

function DragHandle() {
    return <span className="info__drag"></span>
}

function CopyButton({copyToTarget}: {copyToTarget: () => void;}) {
    return <button onClick={copyToTarget}><img className="rarr" alt="Copy" src="/rarrc.svg"/></button>
}

function MoveButton({moveToTarget}: {moveToTarget: () => void;}){
    return <button onClick={moveToTarget}><img className="rarr" alt="Move" src="/rarr.svg" /></button>
}

function DuplicateButton({duplicateFile}: {duplicateFile: () => void}) {
    return <button className="info__dupli" onClick={duplicateFile}>⧺</button>
}


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

