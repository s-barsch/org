import React, { useState, useEffect, useCallback, useContext } from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, Switch, Route, useLocation } from 'react-router-dom';
import Main from 'components/view/main';
//import Nav from 'components/nav/nav';
import Targets from 'funcs/targets';
import { isPresentPath } from 'funcs/files';
import TargetsProvider, { TargetsContext } from './context/targets';
import ErrProvider from './context/err';
import { pageTitle } from 'funcs/paths';
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
            <Switch>
                <Route exact path="/write">
                    <Write />
                </Route>
                <Route exact path="/today">
                    <Today />
                </Route>
                <Route path="/search">
                    <Search />
                </Route>
                <Route path="/">
                    <ViewLoader />
                </Route>
            </Switch>
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
        main: { files: [], sorted: false } as mainObj,
    };
}

function ViewLoader() {
    const { targets } = useContext(TargetsContext);
    const path = useLocation().pathname;

    const [dir, setDir] = useState(newView());
    const [status, setStatus] = useState("");

    function setMain(main: mainObj) {
        dir.main = main;
        setDir({ ...dir });
    }

    useEffect(() => {
        document.title = pageTitle(path);
        setFavicon(path);
    }, [path]);

    // only load when a new *dir* is requested
    useEffect(() => {
        if (shouldLoad(path, dir)) {
            loadView(path);
        }
    }, [dir, path]);

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
        console.log("LOADING VIEW: " + path)

        const resp = await fetch("/api/view" + path);
        if (!resp.ok) {
            if (resp.status === 404) {
                if (path !== "/today" && path !== "/write") {
                    setStatus("404 - not found.");
                    return;
                }
            }
            if (resp.status === 502) {
                setStatus("502 - server down.");
                return;
            }
            // let other errors bubble
        }

        const view = await resp.json();
        setStatus("");
        setDir(view);
    };

    if (status !== "") {
        return <>{status}</>
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
    if (path === "/write" || path === "/today") {
        return false;
    }
    
    if (!isNewDir(path, dir.path)) {
        return false
    }

    if (isPresentPath(dir.main.files, path)) {
        return false
    }
    /*
    if (isText(path) && !isPresentPath(dir.main.files, path)) {
        return true
    }

    if (isText(path) && dir.path && dir.path !== "") {
        return false;
    }
    */
    return true;
}

function isNewDir(path: string, dirPath: string): boolean {
    if (path === dirPath) {
        return false
    }
    if (path.indexOf('.') !== -1 && dirname(path) === dirPath) {
        return false
    }
    return true;
}

function isActiveTarget(targets: Targets, path: string): boolean {
    return targets && path === targets.active;
}

