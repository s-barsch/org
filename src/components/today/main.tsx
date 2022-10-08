import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { newTimestamp, timestampDir } from "funcs/paths";
import { join } from "path";

export default function Today(){
    const path = useLocation().pathname;
    const history = useHistory();
    useEffect(() => {
        async function todayRedirect() {
            fetch("/api/today");
            const path = join("/private/graph", timestampDir(newTimestamp()));
            history.push(path);
        }
        todayRedirect();
    }, [history, path])
    return <></>;
}
