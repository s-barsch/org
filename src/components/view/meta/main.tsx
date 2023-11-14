import React, {useContext } from 'react';
import { ReactComponent as BotIcon} from './bot.svg';
import TopIcon from '@mui/icons-material/DriveFolderUploadSharp';
import DeleteIcon from '@mui/icons-material/ClearSharp';
import { basename, dirname, join } from 'path-browserify';
import File from 'funcs/files';
import { modFuncsObj } from 'components/view/main';
import { copyRequest } from '../../../funcs/requests';
import { ErrContext } from 'context/err';
import { TargetsContext } from 'context/targets';
import FileName from './filename';
//import { ReactComponent as PublicIcon } from './public.svg';
import PublicIcon from '@mui/icons-material/PublicSharp';
import DuplicateIcon from '@mui/icons-material/DifferenceSharp';
import { ReactComponent as CopyIcon } from './copy.svg';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMoveSharp';
import { ReactComponent as RarrC } from './rarrc.svg'
import { ReactComponent as Rarr } from './rarr.svg'

export function Meta({file, modFuncs}: {file: File, modFuncs: modFuncsObj}) {
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

    function duplicateFile() {
        modFuncs.duplicateFile(file);
    }
    // <DragHandle />

    return (
        <div className="info">
            <FileName file={file} modFuncs={modFuncs} />
                <BotToggle file={file} moveFile={modFuncs.moveFile} />
                <DuplicateButton duplicateFile={duplicateFile} />
            <span className="group">
                <CopyButton copyToTarget={copyToTarget} />
                <MoveButton moveToTarget={moveToTarget} />
            </span>
            <PubButton file={file} copyFile={copyFile} />
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
    /*
    function RarrC() {
        return <img className="rarr" alt="Move" src="/rarrC.svg" />;
    }
    */
    return <button onClick={copyToTarget} title="Copy to folder"><RarrC className='rarr'/></button>
}

function MoveButton({moveToTarget}: {moveToTarget: () => void;}){
    /*
    function Rarr() {
        return <img className="rarr" alt="Move" src="/rarr.svg" />;
    }
    */
    return <button onClick={moveToTarget} title="Move to folder"><Rarr className='rarr' /></button>
}

function DuplicateButton({duplicateFile}: {duplicateFile: () => void}) {
    return <button className="info__dupli" onClick={duplicateFile} title="Duplicate file"><DuplicateIcon /></button>
}


type BotToggleProps = {
    file: File;
    moveFile: (f: File, newPath: string) => void;
}

export function BotToggle({file, moveFile}: BotToggleProps) {
    const target = basename(dirname(file.path)) === "bot" ? "top" : "bot";
    const Icon = target == "bot" ? BotIcon : TopIcon;

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

