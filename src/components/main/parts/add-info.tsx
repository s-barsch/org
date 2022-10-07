import React from "react";
import { useHistory } from "react-router";

export default function AddInfo({ mainFilePath }: {mainFilePath: string}) {
    const history = useHistory();
    function submit() {
        history.push(mainFilePath + ".info");
    }
    return (
        <div>
        <button className="add-info" onClick={submit}>+ Info</button>
        </div>
    )
}