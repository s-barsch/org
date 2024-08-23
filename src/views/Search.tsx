import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchView } from './search/view';
import Nav from '../parts/Nav';
import File from '../funcs/files';

type resultView = {
   name: string;
   months: monthObj[];
   files: File[]; 
}

export type monthObj = {
    key: string;
    year: string;
    name: string;
    count: number;
}


export function newResults(): resultView {
    return {
        name: "",
        months: [],
        files: [],
    };
}

export default function Search() {
    const path = useLocation().pathname;
    const [view, setView] = useState(newResults());

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
            <SearchView path={path} months={view.months} files={view.files} />
        </>
    )
}
