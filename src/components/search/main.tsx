import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { newView } from "app";
import { SearchView } from "./view";
import Nav from "components/nav/main";

export default function Search() {
    const path = useLocation().pathname;
    const [view, setView] = useState(newView());

    useEffect(() => {
        async function loadSearchResults() {
            const resp = await fetch("/api" + path);
            const results = await resp.json();
            setView(results);
        }
        loadSearchResults();
    }, [path])
    return (
        <>
            <Nav path={path} />
            <SearchView path={path} files={view.main.files} />
        </>
    )
}
