import React from 'react';
import { Link } from 'react-router-dom';
import * as p from '../funcs/paths';

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

const CrumbNavigation = ({path, neighbors}) => {
  const deepDir = path.split("/").length > 4;
  return (
    <nav className="crumbs">
      <Root />
      <CrumbList path={path} deepDir={deepDir}/>
      { deepDir && <Neighbors links={neighbors} active={path} /> }
    </nav>
  )
}

const CrumbList = ({path, deepDir}) => {
  if (path === "/") {
    return null
  }

  const items = path.substr(1).split("/");
  if (deepDir) {
    items.pop(); // last element is replaced by neighbor nav
  }
  let href = ""
  return (
    items.map((name, i) => {
      href += "/" + name
      return <Crumb key={i} href={href} name={name} />
    })
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


const Crumb = ({href, name}) => {
  return (
    <>
    <Spacer />
    <Link to={href}>{name}</Link>
    </>
  )
}


export default CrumbNavigation;
