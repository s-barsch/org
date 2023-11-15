import React, { useState, useEffect, useCallback, useContext } from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import View from 'views/folder/main';
//import Nav from 'components/nav/nav';
import Targets from 'funcs/targets';
import TargetsProvider, { TargetsContext } from './context/targets';
import ErrProvider from './context/err';
import { isDir, pageTitle } from 'funcs/paths';
import { setFavicon, blinkFavicon } from 'funcs/favicon';
import Write from 'views/write/write';
import Nav from 'parts/nav/nav';
import Search from 'views/search/main';
import File from 'funcs/files';
import { dirPath } from 'funcs/paths';
import Today from 'views/today/main';
import Topics, { Topic } from 'views/topics/main';

export default function App() {
    return (
    <TargetsProvider>
    <ErrProvider>
        <Router>
            <Routes>
                <Route path="/write" element={<Write />} />
                <Route path="/today" element={<Today />} />
                <Route path="/search/*" element={<Search />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/*" element={<Topic />} />
                <Route path="/*" element={<ViewLoader />} />
            </Routes>
        </Router>
    </ErrProvider>
    </TargetsProvider>
    )
}

export type viewObject = {
    path: string;
    dir: dirContents;
}

export type dirContents = {
    files:  File[];
    sorted: boolean;
}

export function newView(): viewObject {
    return {
        path: "",
        dir: { files: [], sorted: false },
    };
}

function ViewLoader() {
    const { targets } = useContext(TargetsContext);
    const path = useLocation().pathname;

    const [status, setStatus] = useState("");
    const [view, setView] = useState(newView());

    function setDir(dir: dirContents) {
        view.dir = dir;
        setView({ ...view });
    }

    // only load when a new *dir* is requested
    useEffect(() => {
        document.title = pageTitle(path);
        setFavicon(path);

        if (shouldLoad(path, view)) {
            loadView(path);
        }
    }, [path, view]);

    async function loadView(path: string) {
        const resp = await fetch("/api/view" + path);
        if (!resp.ok) {
            setStatus(resp.status + " - " + resp.statusText)
        }
        const newView = await resp.json();
        setView(newView);
    };

    function shouldLoad(path: string, view: viewObject): boolean {
        // load if is new dir
        if (isDir(path) && dirPath(path) !== view.path) {
            return true
        }
        // load if is file but no dir loaded
        if (!isDir(path) && view.path === "") {
            return true
        }
        return false
    }

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

    if (status !== "") {
        return (
            <>
                <Nav path={path} />
                <br />
                <code>{status}</code>
            </>
        );
    }

    return (
        <>
            <Nav path={path} />
            <View path={path} files={view.dir.files} sorted={view.dir.sorted} setDir={setDir} />
        </>
    );
}

function isActiveTarget(targets: Targets, path: string): boolean {
    return targets && path === targets.active;
}