import React, {useContext } from 'react';
import { basename, dirname, join } from 'path-browserify';
import File from 'funcs/files';
import { modFuncsObj } from 'views/folder/main';
import { copyRequest } from '../../funcs/requests';
import { ErrContext } from 'context/err';
import { TargetsContext } from 'context/targets';
import FileName from './rename';
import PublicIcon from '@mui/icons-material/PublicSharp';
import DuplicateIcon from '@mui/icons-material/DifferenceSharp';
import DeleteIcon from '@mui/icons-material/ClearSharp';
import { ReactComponent as RarrC } from './svg/rarrc.svg'
import { ReactComponent as Rarr } from './svg/rarr.svg'
import useView from 'state';

export function Meta({file, modFuncs}: {file: File, modFuncs: modFuncsObj}) {
    const { deleteFile, duplicateFile } = useView();
    let { setErr } = useContext(ErrContext);
    let { targets } = useContext(TargetsContext);

    function copyFile(f: File, newPath: string) {
        copyRequest(f.path, newPath, setErr);
    }

    function moveToTarget() {
        modFuncs.moveFile(file, join(targets.active, file.name));
    }

    function copyToTarget() {
        copyFile(file, join(targets.active, file.name));
    }

    function duplicateFn() {
        duplicateFile(file);
    }

    return (
        <div className="info">
            <FileName file={file} modFuncs={modFuncs} />
            <BotToggle file={file} moveFile={modFuncs.moveFile} />
            <DuplicateButton duplicateFn={duplicateFn} />
            <span className="group">
                <CopyButton copyToTarget={copyToTarget} />
                <MoveButton moveToTarget={moveToTarget} />
            </span>
            <PubButton file={file} copyFile={copyFile} />
            <span className="info__del">
                <Del file={file} deleteFile={deleteFile} />
            </span>
        </div>
    )
}

function DuplicateButton({duplicateFn}: {duplicateFn: () => void}) {
    return <button className="info__dupli" onClick={duplicateFn} title="Duplicate file"><DuplicateIcon /></button>
}

function CopyButton({copyToTarget}: {copyToTarget: () => void;}) {
    return <button onClick={copyToTarget} title="Copy to folder"><RarrC className='rarr'/></button>
}

function MoveButton({moveToTarget}: {moveToTarget: () => void;}){
    return <button onClick={moveToTarget} title="Move to folder"><Rarr className='rarr' /></button>
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


    function move() {
        const publicPath = file.path.replace("/private", "/public/");
        copyFile(file, publicPath);
        return;
    }

    return <button className="info__pub" onClick={move}><PublicIcon /></button>
}

type DelProps = {
    file: File;
    deleteFile: (f: File) => void;
}

export function Del({file, deleteFile}: DelProps) {
    function del() {
        if (window.confirm("Delete this " + file.name + "?")) {
            deleteFile(file);
        }
    }
    return <button className="del" onClick={del}><DeleteIcon /></button>
}

