import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TargetsContext } from '../../targets';
import { basename } from 'path';
import { isText } from '../../funcs/paths';

const Spacer = () => {
  return (
    <span className="spacer">/</span>
  )
}

const Root = () => {
  return (
    <Link to="/">org</Link>
  )
}

const CrumbNav = ({path, nav}) => {
  const sibs = nav.siblings && nav.siblings.length > 0;
  const text = isText(path);
  return (
    <nav className="crumbs">
      <Root />
      <CrumbList path={path} switcher={nav.switcher} trim={sibs || text} />
    { sibs &&
      <Siblings path={path} files={nav.siblings} siblingPath={nav.path} />
    }
    { text &&
      <>
        <Spacer />
        <CrumbLink href={path} name={basename(path)} />
      </>
    }
    </nav>
  )
}

const CrumbList = ({path, switcher, trim}) => {
  if (path === "/") {
    return null
  }

  const items = path.substr(1).split("/");

  if (trim) {
    items.pop();
  }

  let href = "";
  return items.map((name, i) => {
    href += "/" + name;

    let cHref = href;
    let className = "";

    if (!switcher !== "" && (name === "private" || name === "public")) {
      cHref = switcher
      className = name
    }

    return (
      <span key={i}>
        <Spacer />
        <CrumbLink href={cHref} name={name} className={className} />
      </span>
    )
  })
}

const CrumbLink = ({href, name, className, isActive}) => {
  const { setActiveTarget } = useContext(TargetsContext);
  const setTarget = evt => {
    if (evt.shiftKey) {
      evt.preventDefault();
      setActiveTarget(evt.target.pathname);
    }
  }
  if (isActive) {
    className += " active"
  }
  return (
    <Link className={className} to={href} onClick={setTarget}>{name}</Link>
  )
}


const Siblings = ({path, files, siblingPath}) => {
  if (path !== siblingPath) {
    return null;
  }
  return (
    <>
      <Spacer />
      <nav className="siblings">
      { files.map((f, i) => (
        <CrumbLink key={i} href={f.path} name={f.name} isActive={path === f.path} />
      ))}
      </nav>
    </>
  )
}


export default CrumbNav;
