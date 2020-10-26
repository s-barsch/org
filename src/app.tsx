import React, { useState, useEffect, useCallback, useContext } from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import Main from 'components/main/main';
//import Nav from 'components/nav/nav';
import Targets from 'funcs/targets';
import TargetsProvider, { TargetsContext } from './context/targets';
import { isToday, pageTitle, isText } from 'funcs/paths';
import { setFavicon, blinkFavicon } from 'funcs/favicon';
import H from 'history';
import File from 'funcs/files';

export default function App() {
    return (
        <Router>
        <TargetsProvider>
        <Loader />
        </TargetsProvider>
        </Router>
    )
}

export type viewObj = {
    path: string;
    nav: navObj;
    main: mainObj;
}

export type mainObj = {
    files:  File[];
    sorted: boolean;
}

export type navObj = {
    path: string;
    switcher: string;
    siblings: File[];
    links: string[];
}

function newView(): viewObj {
    return {
        path: "",
        nav:  {} as navObj,
        main: {} as mainObj,
    };
}

export type errObj = {
    path: string;
    func: string;
    code: number;
    msg:  string;
}

function newErr(): errObj {
    return {
        path: "",
        func: "",
        code: 0,
        msg:  ""
    }
}

function Loader() {
    const { targets } = useContext(TargetsContext);
    const path = useLocation().pathname;
    const history = useHistory();

    const [err, setErr] = useState(newErr());
    const [dir, setDir] = useState(newView());
    const [status, setStatus] = useState("");

    function setMain(main: mainObj) {
        dir.main = main;
        setDir({ ...dir });
    }

    // "/today" redirects to "/graph/20/20-10/24" (current day)
    useEffect(() => {
        document.title = pageTitle(path);
        setFavicon(path);
        if (isToday(path)) {
            todayRedirect(history);
            return;
        }
    }, [path, history]);

    // only load when a new *dir* is requested
    useEffect(() => {
        if (shouldLoad(path, dir)) {
            loadView(path);
        }
    }, [path, dir]);

    // listen if another tab sends files to this tab.
    const listenForWrite = useCallback(evt => {
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
        const resp = await fetch("/api/view" + path);

        if (!resp.ok) {
            if (resp.status === 404) {
                setStatus("404 - not found.");
                return;
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
        <Main path={path} files={dir.main.files} sorted={dir.main.sorted} nav={dir.nav} err={err} setMain={setMain} setErr={setErr} />
        </>
    )
}

async function todayRedirect(history: H.History<any>) {
    const resp = await fetch("/api/today");
    const todayPath = await resp.text();
    history.push(todayPath)
}

function shouldLoad(path: string, dir: viewObj): boolean {
    if (path === dir.path) {
        return false
    }
    if (isText(path) && dir.path && dir.path !== "") {
        return false;
    }
    return true;
}

function isActiveTarget(targets: Targets, path: string): boolean {
    return targets && path === targets.active;
}

