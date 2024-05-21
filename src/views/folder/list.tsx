import React, { useEffect, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ReverseIcon from '@mui/icons-material/SwapVert';
import { ReactSortable } from 'react-sortablejs';
import { basename } from 'path-browserify';
import File from 'funcs/files';
import { modFuncsObj } from 'views/folder/main';
import { setActiveTarget } from 'funcs/targets';
import { TargetsContext } from 'context/targets';
import { separate } from 'funcs/sort';
import { FileSwitch } from 'views/folder/switch'
import { Meta } from '../../parts/meta/main';
import Sortable from 'sortablejs';
import { flushSync } from 'react-dom';
import useView from 'state';

type FileListProps = {
    files: File[];
    modFuncs: modFuncsObj;
}

export function FileList({files, modFuncs}: FileListProps) {
    const { saveSort } = useView();
    const [state, setState] = useState<File[]>(files);

    useEffect(() => {
        setState(files);
    }, [files])

    function reverseFiles() {
        const reverse = separate(state.slice().reverse());
        saveSort(reverse, "files");
    }

    function setFn(newState: File[], sortable: Sortable | null) {
        if (sortable) {
            flushSync(() => setState(newState))
        } else {
            setState(newState)
        }
    }

    function endFn() {
        saveSort(state, "files")
    }

    if (!files || files.length === 0) {
        return null
    }

    // filter=".no-sort"
    return (
        <>
            <span className="right">
                <button onClick={reverseFiles}><ReverseIcon /></button>
            </span>
            <ReactSortable
                handle=".info__name" onEnd={endFn}
                animation={200} list={state} setList={setFn}>
                    { state.map((file, i) => (
                        <div key={file.id}>
                        <Meta file={file} modFuncs={modFuncs} />
                        <FileSwitch file={file} modFuncs={modFuncs} isSingle={false} />
                        </div>
                    ))}

            </ReactSortable>
        </>
    );
}

function Dir({dir}: {dir: File;}) {
    let { targets, saveTargets } = useContext(TargetsContext);

    function setTarget(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            saveTargets(setActiveTarget(targets, e.currentTarget.pathname));
        }
    }
    return (
        <Link to={dir.path} onClick={setTarget}>{basename(dir.path)}</Link>
    )
}

export function DirList({dirs}: { dirs: File[] }) {
    const { saveSort } = useView();
    const [state, setState] = useState(dirs);

    useEffect(() => {
        setState(dirs);
    }, [dirs])

    function endFn() {
        saveSort(state, "dirs");
    };

    function setFn(newState: File[], sortable: Sortable | null) {
        if (sortable) {
            flushSync(() => setState(newState))
        } else {
            setState(newState)
        }
    }

    return (
        <ReactSortable className="dirs__list" onEnd={endFn}
        animation={200} list={state} setList={setFn}>
        {state.map((dir) => (
            <Dir key={dir.id} dir={dir} />
        ))}
        </ReactSortable>
    )
}
