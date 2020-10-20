import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TargetsContext } from '../../targets';
import { basename } from 'path';
import { isText } from '../../funcs/paths';
import { Nav } from '../../types';
import File from '../../funcs/file';

function Spacer() {
    return (
        <span className="spacer">/</span>
    )
}

function RootLink() {
    return (
        <Link to="/">org</Link>
    )
}

type CrumbNavProps = {
    path: string;
    nav: Nav;
}

function CrumbNav({path, nav}: CrumbNavProps) {
    const sibs = nav.siblings && nav.siblings.length > 0;
    const text = isText(path);
    return (
        <nav className="crumbs">
        <RootLink />
        <CrumbList path={path} switcher={nav.switcher} trim={sibs || text} />
        { sibs &&
            <Siblings path={path} files={nav.siblings} siblingPath={nav.path} />
        }
        { text &&
                <>
                <Spacer />
                <CrumbLink href={path} name={basename(path)} className="" isActive={false} />
                </>
        }
        </nav>
    )
}

type CrumbListProps = {
    path: string;
    switcher: string;
    trim: boolean;
}

function CrumbList({path, switcher, trim}: CrumbListProps) {
    if (path === "/") {
        return null
    }

    const items = path.substr(1).split("/");

    if (trim) {
        items.pop();
    }

    let href = "";
    return (
        <>{items.map((name, i) => {
            href += "/" + name;

            let cHref = href;
            let className = "";

            if (switcher && (name === "private" || name === "public")) {
                cHref = switcher
                className = name
            }

            return (
                <span key={i}>
                <Spacer />
                <CrumbLink href={cHref} name={name} className={className} isActive={false} />
                </span>
            )
        })}</>
    )
}

type CrumbLinkProps = {
    href: string;
    name: string;
    className: string;
    isActive: boolean;
}

function CrumbLink({href, name, className, isActive}: CrumbLinkProps) {
    const { setActiveTarget } = useContext(TargetsContext);


    function setTarget(e: React.MouseEvent<HTMLAnchorElement>) {
        if (e.shiftKey) {
            e.preventDefault();
            if (!setActiveTarget) {
                alert("setActiveTarget undefined");
                return;
            }
            setActiveTarget(e.currentTarget.pathname);
        }
    }

    if (isActive) {
        className += " active"
    }

    return (
        <Link className={className} to={href} onClick={setTarget}>{name}</Link>
    )
}


type SiblingsProps = {
    path: string;
    files: File[];
    siblingPath: string;
}

function Siblings({path, files, siblingPath}: SiblingsProps) {
    if (path !== siblingPath) {
        return null;
    }
    return (
        <>
        <Spacer />
        <nav className="siblings">
        { files.map((f, i) => (
            <CrumbLink key={i} href={f.path} name={f.name} className="" isActive={path === f.path} />
        ))}
        </nav>
        </>
    )
}


export default CrumbNav;
