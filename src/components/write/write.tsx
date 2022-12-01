import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { newTimestamp, timestampDir } from "funcs/paths";
import { join } from "path-browserify";

export default function Write(){
    const navigate = useNavigate();
    useEffect(() => {
        fetch("/api/today");
        const ts = newTimestamp();
        const path = join("/private/graph", timestampDir(ts), ts + ".txt");
        navigate(path)
    }, [navigate])
    return <></>;
}
