import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import * as p from '../../funcs/paths';
import { TargetsContext } from '../../targets';

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

const CrumbNav = ({path, neighbors, switchLink}) => {
  const deepDir = path.split("/").length > 4 && path.indexOf(".") < 0;
  return (
    <nav className="crumbs">
      <Root />
      <CrumbList path={path} switchLink={switchLink} deepDir={deepDir} />
      { deepDir && <Neighbors links={neighbors} active={path} /> }
    </nav>
  )
}

const CrumbList = ({path, deepDir, switchLink}) => {
  if (path === "/") {
    return null
  }

  const items = path.substr(1).split("/");

  // last element is replaced by neighbor nav
  if (deepDir) {
    items.pop();
  }

  let href = "";
  return items.map((name, i) => {
    href += "/" + name;

    let cHref = href;
    let className = "";

    if (!switchLink !== "" && (name === "private" || name === "public")) {
      cHref = switchLink
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


const Neighbors = ({links, active}) => {
  return (
    <>
      <Spacer />
      <nav className="neighbors">
      { links.map((l, i) => (
        <CrumbLink key={i} href={l} name={p.Base(l)} isActive={active === l} />
      ))}
      </nav>
    </>
  )
}


export default CrumbNav;
