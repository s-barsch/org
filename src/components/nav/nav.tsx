import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import TargetIcon from '@material-ui/icons/VerticalAlignBottom';
import { basename, dirname } from 'path';
import CrumbNav from 'components/nav/crumbs';
import { Del } from 'components/meta';
import { extendedBase, section } from 'funcs/paths';
import { TargetsContext, TargetsProps } from 'context/targets';
import File from 'funcs/file';
import { setActiveTarget, removeTarget } from 'funcs/targets';
import { Nav, errObj } from 'app';

type NavViewProps = {
    pathname: string;
    nav: Nav;
    err: errObj;
}

function NavView({pathname, nav, err}: NavViewProps) {
    const { targets, saveTargets } = useContext(TargetsContext);

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
        saveTargets(setActiveTarget(targets, pathname));
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
        name: basename(pathname),
        path: pathname,
        type: 'dir',
        body: '',
        id:   Date.now()
    }

    if (!nav) {
        return null
    }

    return (
        <>
        <nav id="links">
            <span className="links__top">
                <LinkList links={nav.links} active="" />
            </span>
            <span className="right">
                <TargetButton clickFn={setThisActive} />
                <button onClick={toggleTheme} ><ThemeIcon /></button>
                <Del file={viewFile} deleteFile={deleteDir} />
            </span>
        </nav>
        <nav id="bar">
            <CrumbNav path={pathname} nav={nav}/>
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

export default NavView;

function readStateBool(key: string): boolean {
    const str = localStorage.getItem(key);
    if (str == null) {
        return false;
    }
    return str === "true";
}

