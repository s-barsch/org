import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { newTimestamp, timestampDir } from "funcs/paths";
import { join } from 'path-browserify';

export default function Today(){
    const path = useLocation().pathname;
    const navigate = useNavigate();
    useEffect(() => {
        async function todayRedirect() {
            fetch("/api/today");
            const path = join("/private/graph", timestampDir(newTimestamp()));
            navigate(path);
        }
        todayRedirect();
    }, [navigate, path])
    return <></>;
}
