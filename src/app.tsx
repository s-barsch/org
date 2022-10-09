import React, { useState, useEffect, useCallback, useContext } from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Main from 'components/view/main';
//import Nav from 'components/nav/nav';
import Targets from 'funcs/targets';
import TargetsProvider, { TargetsContext } from './context/targets';
import ErrProvider from './context/err';
import { isDir, pageTitle } from 'funcs/paths';
import { setFavicon, blinkFavicon } from 'funcs/favicon';
import Write from 'components/write/write';
import Nav from 'components/nav/main';
import Search from 'components/search/main';
import File from 'funcs/files';
import { dirname } from 'path';
import Today from 'components/today/main';

export default function App() {
    return (
    <TargetsProvider>
    <ErrProvider>
        <Router>
            <Routes>
                <Route path="/write" element={<Write />} />
                <Route path="/today" element={<Today />} />
                <Route path="/search*" element={<Search />} />
                <Route path="/*" element={<ViewLoader />} />
            </Routes>
        </Router>
    </ErrProvider>
    </TargetsProvider>
    )
}

export type viewObj = {
    path: string;
    main: mainObj;
}

export type mainObj = {
    files:  File[];
    sorted: boolean;
}

export function newView(): viewObj {
    return {
        path: "",
        main: { files: [], sorted: false },
    };
}

function ViewLoader() {
    const { targets } = useContext(TargetsContext);
    const path = useLocation().pathname;

    const [status, setStatus] = useState("");
    const [dir, setDir] = useState(newView());

    function setMain(main: mainObj) {
        dir.main = main;
        setDir({ ...dir });
    }

    // only load when a new *dir* is requested
    useEffect(() => {
        document.title = pageTitle(path);
        setFavicon(path);

        console.log(dir.path)
        if (shouldLoad(path, dir)) {
            loadView(path);
        }
    }, [path, dir]);

    // listen if another tab sends files to this tab.
    const listenForWrite = useCallback(() => {
        if (isActiveTarget(targets, path)) {
            loadView(path);
            blinkFavicon(path);
        }
    }, [targets, path]);

    useEffect(() => {
        window.addEventListener('storage', listenForWrite);

        return () => {
            window.removeEventListener('storage', listenForWrite);
        };
    }, [listenForWrite]);

    async function loadView(path: string) {
        // console.log("LOADING VIEW: " + path)

        const resp = await fetch("/api/view" + path);
        if (!resp.ok) {
            setStatus(resp.status + " - " + resp.statusText)
        }

        const view = await resp.json();
        setDir(view);
    };
    
    if (status !== "") {
        return <>
            <Nav path={path} />
            <br />
            <code>{status}</code>
        </>;
    }

    return (
        <>
            <Nav path={path} />
            <Main path={path} files={dir.main.files} sorted={dir.main.sorted}
            setMain={setMain} />
        </>
    )
}

function shouldLoad(path: string, dir: viewObj): boolean {
    // load if is new dir
    if (isDir(path) && dirPath(path) !== dir.path) {
        return true
    }
    // load if is file but no dir loaded
    if (!isDir(path) && dir.path === "") {
        return true
    }
    return false
}

function dirPath(path: string): string {
    if (isDir(path)) {
        return path;
    }
    return dirname(path)
}

function isActiveTarget(targets: Targets, path: string): boolean {
    return targets && path === targets.active;
}

/*
function isNewDir(path: string, dirPath: string): boolean {
    if (path === dirPath) {
        return false
    }
    if (path.indexOf('.') !== -1 && dirname(path) === dirPath) {
        return false
    }
    return true;
}

function shouldLoad(
        /*
    if (!isNewDir(path, dir.path)) {
        return false
    }

    if (isPresentPath(dir.main.files, path)) {
        return false
    }
    */
    /*
    if (isText(path) && !isPresentPath(dir.main.files, path)) {
        return true
    }

    if (isText(path) && dir.path && dir.path !== "") {
        return false;
    }
    return true;
)
    */