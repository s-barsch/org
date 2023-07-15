import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { newTimestamp, timestampDir } from "funcs/paths";
import { join } from "path-browserify";

export default function Write(){
    const navigate = useNavigate();
    useEffect(() => {
        async function getDate() {
            const resp = await fetch("/api/today");
            const today = await resp.text()
            const ts = newTimestamp();
            const path = join(today, ts + ".txt");
            //const path = join("/private/graph", timestampDir(ts), ts + ".txt");
            navigate(path)
        }
        getDate();
    }, [navigate])
    return <></>;
}
