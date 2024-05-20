import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { TargetsContext } from './context/targets';
import Nav from 'parts/nav/nav';
import { isDir, pageTitle } from 'funcs/paths';
import { setFavicon, blinkFavicon } from 'funcs/favicon';
import View from 'views/folder/main';
import Targets from 'funcs/targets';
import File from 'funcs/files';
import { dirPath } from 'funcs/paths';

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

export function ViewLoader() {
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

export function isActiveTarget(targets: Targets, path: string): boolean {
    return targets && path === targets.active;
}