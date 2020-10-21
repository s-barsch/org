import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import TargetIcon from '@material-ui/icons/VerticalAlignBottom';
import { basename, dirname } from 'path';
import CrumbNav from './crumbs';
import { Del } from '../meta';
import { extendedBase, section } from '../../funcs/paths';
import { TargetsContext } from '../../targets';
import View from '../../types';
import File from '../../funcs/file';

type TopProps = {
    pathname: string;
    view: View;
}

function Top({pathname, view}: TopProps) {
    const { targetList, activeTarget, removeTarget, setActiveTarget } = useContext(TargetsContext);

    /* theme */

    const [darkTheme, setDarkTheme] = useState(readStateBool("dark-theme"));

    useEffect(() => {
        darkTheme
            ? document.body.dataset["theme"] = "dark"
            : document.body.dataset["theme"] = ""
    })

    function toggleTheme() {
        setDarkTheme(!darkTheme);
        localStorage.setItem("dark-theme", String(!darkTheme));
    }

    function TargetButton({clickFn}: {clickFn: () => void}) {
        return <button onClick={clickFn}><TargetIcon /></button>
    }

    function setThisActive() {
        if (!setActiveTarget) {
            alert("setActiveTarget undefined");
            return;
        }
        setActiveTarget(view.path);
    }

    const history = useHistory();

    async function deleteDir(viewFile: File) {
        try {
            const resp = await fetch("/api/delete" + viewFile.path);
            if (!resp.ok) {
                alert( "Delete failed: " + viewFile.path + "\nreason: " +resp.statusText);
                return;
            }
            history.push(dirname(viewFile.path));
        } catch(err) {
            console.log(err);
        }
    }

    const viewFile: File = {
        name: basename(view.path),
        path: view.path,
        type: 'dir',
        body: '',
        id:   Date.now()
    }

    if (!view.nav) {
        return null
    }

    return (
        <>
        <nav id="links">
            <span className="links__top">
                <LinkList links={view.nav.links} active="" />
            </span>
            <span className="right">
                <TargetButton clickFn={setThisActive} />
                <button onClick={toggleTheme} ><ThemeIcon /></button>
                <Del file={viewFile} deleteFile={deleteDir} />
            </span>
        </nav>
        <nav id="bar">
            <CrumbNav path={pathname} nav={view.nav}/>
            <span className="right">
                <TargetList
                links={targetList ? targetList : []}
                activeTarget={activeTarget ? activeTarget : ""}
                setActiveTarget={setActiveTarget ? setActiveTarget : (path: string) => {}} 
                removeTarget={removeTarget ? removeTarget : (path: string) => {}} />
            </span>
        </nav>
        </>
    )
}

type TargetListProps = {
    activeTarget: string;
    links: string[];
    removeTarget: (path: string) => void;
    setActiveTarget: (path: string) => void;
}

function TargetList({activeTarget, links, removeTarget, setActiveTarget}: TargetListProps) {
    function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            setActiveTarget(e.currentTarget.pathname);
        }
    }
    function onRightClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            removeTarget(e.currentTarget.pathname);
        }
    }
    return (
        <span id="targets">
        { links.map((l, i) => {
            let className = section(l)
            if (activeTarget === l) {
                className += " active"
            }
            return (
                <Link key={i} to={l}
                className={className}
                onClick={onClick} onContextMenu={onRightClick}>
                {extendedBase(l)}
                </Link>
            )
        })
        }
        </span>
    )
}

type LinkListProps = {
    links: string[];
    active: string;
}

function LinkList({links, active}: LinkListProps) {
    if (!links || links.length === 0) {
        return null;
    }
    return (
        <>{links.map((l, i) => (
            <Link key={i} to={l} className={active === l ? "active" : ""}>{basename(l)}</Link>
        ))}</>
    )
}

export default Top;

function readStateBool(key: string): boolean {
    const str = localStorage.getItem(key);
    if (str == null) {
        return false;
    }
    return str === "true";
}

