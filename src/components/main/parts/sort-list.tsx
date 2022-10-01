import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ReverseIcon from '@material-ui/icons/SwapVert';
import { ReactSortable } from 'react-sortablejs';
import { basename } from 'path';
import File from 'funcs/files';
import { mainFuncsObj, modFuncsObj } from 'components/main/main';
import { setActiveTarget } from 'funcs/targets';
import { TargetsContext } from 'context/targets';
import { separate } from 'funcs/sort';
import { FileSwitch } from 'components/main/parts/switch'

const ReactSortable1: any = ReactSortable;

type FileListProps = {
    files: File[];
    saveSort: (part: File[], type: string) => void;
    mainFuncs: mainFuncsObj;
    modFuncs: modFuncsObj;
}

export function FileList({files, saveSort, mainFuncs, modFuncs}: FileListProps) {
    const [state, setState] = useState(files);

    useEffect(() => {
        setState(files);
    }, [files])

    const reverseFiles = () => {
        const reverse = separate(state.slice().reverse());
        saveSort(reverse, "files");
    }

    const callOnEnd = () => {
        saveSort(state, "files");
    };

    if (!files || files.length === 0) {
        return null
    }
    // filter=".no-sort"
    return (
        <>
            <span className="right">
                <button onClick={reverseFiles}><ReverseIcon /></button>
            </span>
            <ReactSortable1 
                handle=".info__drag" 
                onEnd={callOnEnd}
                animation={200} list={state} setList={setState}>

                    { state.map((file, i) => (
                        <FileSwitch key={file.id} file={file} mainFuncs={mainFuncs} modFuncs={modFuncs} isSingle={false} />
                    ))}

            </ReactSortable1>
        </>
    );
}

function Dir({dir}: {dir: File;}) {
    let { targets, saveTargets } = useContext(TargetsContext);

    function setTarget(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            console.log("try to set something");
            e.preventDefault();
            saveTargets(setActiveTarget(targets, e.currentTarget.pathname));
        }
    }
    return (
        <Link to={dir.path} onClick={setTarget}>{basename(dir.path)}</Link>
    )
}

type DirListProps = {
    dirs: File[];
    saveSort: (part: File[], type: string) => void;
}

export function DirList({dirs, saveSort}: DirListProps) {
    const [state, setState] = useState(dirs);

    useEffect(() => {
        setState(dirs);
    }, [dirs])

    const callOnEnd = () => {
        saveSort(state, "dirs");
    };

    return (
        <ReactSortable1 className="dirs__list" onEnd={callOnEnd}
        animation={200} list={state} setList={setState}>
        {state.map((dir) => (
            <Dir key={dir.id} dir={dir} />
        ))}
        </ReactSortable1>
    )
}
