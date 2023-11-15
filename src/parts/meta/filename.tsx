import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
//import EditIcon from '@mui/icons-material/Edit';
//import EditIcon from '@mui/icons-material/FormatColorText';
//import EditIcon from '@mui/icons-material/DriveFileRenameOutline';
import EditIcon from '@mui/icons-material/AutoFixHighSharp';
import { modFuncsObj } from '../../views/folder/main';
import File from 'funcs/files';
import { join, dirname } from 'path-browserify';

export default function FileName({file, modFuncs}: {file: File, modFuncs: modFuncsObj}) {
    const [edit, setEdit] = useState(false);

    const [name, setName] = useState("");

    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
        if (!file) {
            return;
        }
        setName(file.name);
    }, [file]);

    useEffect(() => {
        if (edit && ref && ref.current) {
            ref.current.focus({preventScroll:true})
        }
    }, [edit]);


    function handleTyping(e: React.FormEvent<HTMLInputElement>) {
        setName(e.currentTarget.value);
    }

    function toggleEdit(e: React.MouseEvent<HTMLButtonElement>) {
        setEdit(!edit);
    }

    function rename(e: React.FormEvent<HTMLInputElement>) {
        setEdit(false);
        if (name === file.name) {
            return;
        }
        const oldPath = file.path;
        file.path = join(dirname(file.path), name);
        file.name = name;
        modFuncs.renameFile(oldPath, file);
    }

    return (
        <span className="info__file">
            {!edit ? (
                <Link className='info__name' to={file.path}>{name}</Link>
            ) : (
                <input
                    disabled={edit ? false : true} size={name.length}
                    value={name} className="info__rename"
                    onChange={handleTyping} ref={ref} onBlur={rename}
                />
            )}
        <button onClick={toggleEdit} className="info__edit"><EditIcon /></button>
        </span>
    )
}