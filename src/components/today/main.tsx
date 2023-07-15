import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { newTimestamp, timestampDir } from "funcs/paths";
import { join } from 'path-browserify';

export default function Today(){
    const navigate = useNavigate();
    useEffect(() => {
        async function todayRedirect() {
            const resp = await fetch("/api/today");
            const today = await resp.text();
            navigate(today);
        }
        todayRedirect();
    }, [navigate])
    return <></>;
}
