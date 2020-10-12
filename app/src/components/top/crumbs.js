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
  const deepDir = path.split("/").length > 4 && neighbors.length > 0;
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
  if (deepDir) {
    items.pop(); // last element is replaced by neighbor nav
  }
  let render = [];
  let href = "";
  for (let i = 0; i < items.length; i++) {
    const name = items[i];
    href += "/" + name
    let className = ""
    let itemHref = href
    if ((name === "private" || name === "public") && switchLink !== "") {
      className = name
      itemHref = switchLink
    }
    render.push(<Crumb key={i} href={itemHref} name={name} className={className} />)
  }
  return <>{render}</>
}

const Crumb = ({href, name, className}) => {
  const { setActiveTarget } = useContext(TargetsContext);
  const setTarget = evt => {
    if (evt.shiftKey) {
      evt.preventDefault();
      setActiveTarget(evt.target.pathname);
    }
  }
  return (
    <>
    <Spacer />
    <Link className={className} to={href} onClick={setTarget}>{name}</Link>
    </>
  )
}


const Neighbors = ({links, active}) => {
  return (
    <>
      <Spacer />
      <nav className="neighbors">
        <LinkList links={links} active={active} />
      </nav>
    </>
  )
}

const LinkList = ({links, active}) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    links.map((l, i) => (
      <Link key={i} to={l} className={active === l ? "active" : ""}>{p.Base(l)}</Link>
    ))
  )
}



export default CrumbNav;
