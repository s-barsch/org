import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeIcon from '@mui/icons-material/WbSunnySharp';
import TargetIcon from '@mui/icons-material/AddShoppingCartOutlined';
import { basename, dirname } from 'path-browserify';
import CrumbNav from 'components/nav/crumbs';
import { Del } from 'components/view/meta/main';
import { extendedBase, section } from 'funcs/paths';
import { TargetsContext, TargetsProps } from 'context/targets';
//import { ErrContext } from 'context/err';
import File from 'funcs/files';
import { setActiveTarget, removeTarget } from 'funcs/targets';
import { ErrComponent } from 'components/nav/error';
import Config from 'config';
import { ErrContext } from 'context/err';

type NavProps = {
    path: string;
}

/*
type NavMeta = {
    switcher: string;
    siblings: File[];
}
*/

function newNavMeta() {
    return {
        "switcher": "",
        "siblings": []
    }
}

export default function Nav({path}: NavProps) {
    const { err } = useContext(ErrContext);
    const { targets, saveTargets } = useContext(TargetsContext);

    /* theme */

    const [darkTheme, setDarkTheme] = useState(readStateBool("dark-theme"));

    useEffect(() => {
        darkTheme
            ? document.body.dataset["theme"] = "dark"
            : document.body.dataset["theme"] = ""
    }, [darkTheme])

    function toggleTheme() {
        setDarkTheme(!darkTheme);
        localStorage.setItem("dark-theme", String(!darkTheme));
    }

    function TargetButton({clickFn}: {clickFn: () => void}) {
        return <button onClick={clickFn}><TargetIcon /></button>
    }

    function setThisActive() {
        saveTargets(setActiveTarget(targets, path));
    }

    const [meta, setMeta] = useState(newNavMeta());

    useEffect(() => {
        async function fetchNav() {
            const resp = await fetch('/api/nav' + path);
            if (resp.ok) {
                setMeta(await resp.json());
            }
        }
        fetchNav();
    }, [path]);


    const navigate = useNavigate();

    async function deleteDir(viewFile: File) {
        try {
            const resp = await fetch("/api/delete" + viewFile.path);
            if (!resp.ok) {
                alert( "Delete failed: " + viewFile.path + "\nreason: " +resp.statusText);
                return;
            }
            navigate(dirname(viewFile.path));
        } catch(err) {
            console.log(err);
        }
    }

    const viewFile: File = {
        name: basename(path),
        path: path,
        type: 'dir',
        body: '',
        id:   Date.now()
    }

    return (
        <>
        <nav id="links">
            <span className="links__top">
                <LinkList links={Config.links} active="" />
            </span>
            <span className="right">
                <ErrComponent err={err} />
                <TargetButton clickFn={setThisActive} />
                <button onClick={toggleTheme} ><ThemeIcon /></button>
                <Del file={viewFile} deleteFile={deleteDir} />
            </span>
        </nav>
        <nav id="bar">
            <CrumbNav path={path} switcher={meta.switcher} siblings={meta.siblings}/>
            <TargetsList targets={targets} saveTargets={saveTargets}/>
        </nav>
        </>
    )
}

function TargetsList({targets, saveTargets}: TargetsProps) {

    function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            saveTargets(setActiveTarget(targets, e.currentTarget.pathname));
        }
    }

    function onRightClick(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            saveTargets(removeTarget(targets, e.currentTarget.pathname));
        }
    }

    if (targets.list.length === 0) {
        return null
    }

    return (
        <span id="targets" className="right">
        { targets.list.map((l, i) => {
            let className = section(l)
            if (targets.active === l) {
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

function readStateBool(key: string): boolean {
    const str = localStorage.getItem(key);
    if (str == null) {
        return false;
    }
    return str === "true";
}

