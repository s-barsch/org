import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import File from '../../../funcs/files';
import useView from '../../../state';
import { useNavigate } from 'react-router-dom';

type TextFieldProps = {
    file: File;
    isSingle: boolean;
}

export default function TextField({file, isSingle}: TextFieldProps) {
    const { writeFile, createFilePath } = useView();
    const [body, setBody] = useState(file.body);
    const navigate = useNavigate();

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

    function submit() {
        if (body === "") {
            return;
        }
        file.body = body;
        writeFile(file);
    }

    function checkSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.ctrlKey && e.key === "Enter") {
            submit();
            navigate(createFilePath());
        }
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            submit();
        }
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

