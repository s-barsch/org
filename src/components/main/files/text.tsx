import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Info } from 'components/main/files/meta';
import { modFuncsObj } from 'components/main/main';
import File from 'funcs/files';

type TextFieldProps = {
    file: File;
    modFuncs: modFuncsObj;
    isSingle: boolean;
}

export default function TextField({file, modFuncs, isSingle}: TextFieldProps) {
    const [body, setBody] = useState(file.body);

    useEffect(() => {
        setBody(file.body);
    }, [file]);

    const ref = useRef<HTMLTextAreaElement>(null!)

    useEffect(() => {
        if (isSingle && ref && ref.current) {
            ref.current.focus({preventScroll:true});
        }
    }, [isSingle]);

    function handleTyping(e: React.FormEvent<HTMLTextAreaElement>) {
        setBody(e.currentTarget.value);
    }

    function submit(e: React.FormEvent<HTMLTextAreaElement>) {
        file.body = body;
        modFuncs.writeFile(file);
    }

    return (
        <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
        { !isSingle &&
            <Info file={file} modFuncs={modFuncs}/>
        }
        <TextareaAutosize value={body}
        ref={ref}
        minRows={!isSingle ? 1 : fullScreenRows()}
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

