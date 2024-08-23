import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { newTimestamp } from 'funcs/paths';
import { join } from 'path-browserify';

export default function Write(){
    const navigate = useNavigate();
    useEffect(() => {
        async function writeRedirect() {
            const resp = await fetch("/api/today");
            const today = await resp.text()
            const ts = newTimestamp();
            const path = join(today, ts + ".txt");
            navigate(path)
        }
        writeRedirect();
    }, [navigate])
    return <></>;
}
