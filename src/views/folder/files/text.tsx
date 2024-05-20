import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import File from 'funcs/files';
import useView from 'state';

type TextFieldProps = {
    file: File;
    createFile?: () => void;
    isSingle: boolean;
}

export default function TextField({file, createFile, isSingle}: TextFieldProps) {
    const { writeFile } = useView();
    const [body, setBody] = useState(file.body);

    const ref = useRef<HTMLTextAreaElement>(null!)

    useEffect(() => {

        setBody(file.body);

        if (isSingle && ref && ref.current) {
            ref.current.focus({preventScroll:true});
        }

    }, [file, isSingle]);

    function handleTyping(e: React.FormEvent<HTMLTextAreaElement>) {
        setBody(e.currentTarget.value);
    }

    function checkSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.ctrlKey && e.key === "Enter") {
            submit(e);
            if (createFile) createFile();
        }
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            submit(e);
        }
    }

    function submit(e: React.FormEvent<HTMLTextAreaElement>) {
        if (body === "") {
            return;
        }
        file.body = body;
        writeFile(file);
    }

    return (
        <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
            <TextareaAutosize value={body}
                className="text-field"
                name={file.id.toString()} ref={ref}
                minRows={!isSingle ? 1 : fullScreenRows()}
                onKeyDown={checkSubmit}
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

