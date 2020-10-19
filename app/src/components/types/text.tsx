import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Info } from '../meta';
import { ModFuncs } from '../../types';
import File from '../../funcs/file';

type TextFieldProps = {
    file: File;
    modFuncs: ModFuncs;
    single: boolean;
}

export default function TextField({file, modFuncs, single}: TextFieldProps) {
    const [body, setBody] = useState(file.body);

    useEffect(() => {
        setBody(file.body);
    }, [file]);

    const ref = useRef<HTMLTextAreaElement>(null!)

    useEffect(() => {
        if (single && ref && ref.current) {
            ref.current.focus({preventScroll:true});
        }
    }, [single]);

    function handleTyping(e: React.FormEvent<HTMLTextAreaElement>) {
        setBody(e.currentTarget.value);
    }

    const submit = () => {
        file.body = body;
        modFuncs.writeFile(file);
    }

    return (
        <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
        { !single &&
            <Info file={file} modFuncs={modFuncs}/>
        }
        <TextareaAutosize value={body}
        ref={ref}
        minRows={!single ? 1 : fullScreenRows()}
        onChange={handleTyping}
        onBlur={submit} />
        </div>
    )
}

function isNoSort(name: string): boolean {
    switch (name) {
        case "info":
        case ".sort":
            return true;
        default:
            return false;
    }
}

function fullScreenRows() {
    return Math.round(window.screen.height/(2.25*16)) - 8
}

