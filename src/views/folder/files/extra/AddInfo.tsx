import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddInfo({ mainFilePath }: {mainFilePath: string}) {
    const navigate = useNavigate();
    function submit() {
        navigate(mainFilePath + ".info");
    }
    return (
        <div>
        <button className="add-info" onClick={submit}>+ Info</button>
        </div>
    )
}