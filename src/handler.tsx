import React, { useState, useEffect, useCallback, useContext } from 'react';
import './css/main.css';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import FileView from './components/main/view';
import Nav from './components/nav/nav';
import TargetsProvider, { TargetsContext } from "./context/targets";
import { basename } from 'path';
import { section, isText } from './funcs/paths';
import View from './types';
import H from 'history';

export default function App() {
    return (
        <Router>
        <TargetsProvider>
        <Handler />
        </TargetsProvider>
        </Router>
    )
}

function Handler() {
    const { targets } = useContext(TargetsContext);
    const path = useLocation().pathname;
    const history = useHistory();

    const [view, setView] = useState({} as View);
    const [lastPath, setLastPath] = useState("");
    const [notFound, setNotFound] = useState(false);

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
            setView(view);
            setLastPath(view.path);
        } catch(err) {
            console.log(err)
        }
    }

    useEffect(() => {
        document.title = pageTitle(path);

        if (path === view.path) {
            return;
        }

        if (isText(path) && view.path && view.path !== "") {
            return;
        }

        if (isToday(path)) {
            todayRedirect(history);
            return;
        }

        loadView(path);
    }, [path, view, lastPath, history]);


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
        <Nav pathname={path} view={view} />
        <FileView pathname={path} view={view} setView={setView} />
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
