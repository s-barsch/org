import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import File from 'funcs/files';

type TextFieldProps = {
    file: File;
    createNewText?: () => void;
    writeText: (f: File) => void;
    isSingle: boolean;
}

export default function TextField({file, writeText, createNewText, isSingle}: TextFieldProps) {
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
        if (e.ctrlKey && e.key === "Enter" && createNewText !== undefined) {
            submit(e);
            //const newFile = createNewFile === undefined ? () => {} : createNewFile;
            createNewText();
        }
    }

    function submit(e: React.FormEvent<HTMLTextAreaElement>) {
        if (body === "") {
            return;
        }
        file.body = body;
        writeText(file);
    }

    return (
        <div className={"text" + (isNoSort(file.name) ? " no-sort" : "")}>
            <TextareaAutosize value={body}
                className="text-field"
                ref={ref}
                minRows={!isSingle ? 1 : fullScreenRows()}
                onKeyPress={checkSubmit}
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

