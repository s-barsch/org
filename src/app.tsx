import React, { useState, useEffect, useCallback, useContext } from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import MainView from 'components/main/view';
import NavView from 'components/nav/nav';
import TargetsProvider, { TargetsContext } from "./context/targets";
import { basename } from 'path';
import { section, isText } from 'funcs/paths';
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

export type DirView = {
    path: string;
    nav: Nav;
    main: Main;
}

export type Main = {
    files:  File[];
    sorted: boolean;
}

export type Nav = {
    path: string;
    switcher: string;
    siblings: File[];
    links: string[];
}

function newDirView(): DirView {
    return {
        path: "",
        nav:  {} as Nav,
        main: {} as Main
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
    const [dir, setDir] = useState(newDirView());
    const [notFound, setNotFound] = useState(false);

    function setMain(main: Main) {
        dir.main = main;
        setDir({ ...dir });
    }

    async function loadView(path: string) {
        blinkFavicon(path);
        try {
            console.log("LOAD VIEW");
            const resp = await fetch("/api/view" + path);
            if (!resp.ok) {
                setNotFound(true)
                return;
            }
            setNotFound(false);
            const view = await resp.json();
            setDir(view);
        } catch(err) {
            console.log(err)
        }
    };


    useEffect(() => {
        if (isToday(path)) {
            todayRedirect(history);
            return;
        }
    }, [path, history]);

    useEffect(() => {
        document.title = pageTitle(path);

        if (path === dir.path) {
            return;
        }

        if (isText(path) && dir.path && dir.path !== "") {
            return;
        }

        loadView(path);
    }, [path, dir]);

    const listenForWrite = useCallback(evt => {
        if (targets && path === targets.active) {
            loadView(path);
        }
    }, [targets, path]);

    useEffect(() => {
        window.addEventListener('storage', listenForWrite);

        return () => {
            window.removeEventListener('storage', listenForWrite);
        };
    }, [listenForWrite]);

    if (notFound) {
        return <>404</>
    }

    return (
        <>
        <NavView pathname={path} nav={dir.nav} err={err} />
        <MainView path={path} files={dir.main.files} sorted={dir.main.sorted} setMain={setMain} setErr={setErr} />
        </>
    )
}

function blinkFavicon(path: string) {
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!favicon) return;
    favicon.href = "/blue.svg";
    setTimeout(() => {
        if (!favicon) return;
        favicon.href = "/" + section(path) + ".svg";
    }, 100);
}

function pageTitle(path: string): string {
    if (path === "/") {
        return "ORG"
    }
    return basename(path) + " - ORG";
}

function isToday(path: string): boolean {
    return path === "/today";
}

async function todayRedirect(history: H.History<any>) {
    const resp = await fetch("/api/today");
    const todayPath = await resp.text();
    history.push(todayPath)
}
