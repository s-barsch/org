import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { basename } from 'path';
import { isText } from '../../funcs/paths';
import { TargetsContext } from '../../targets';

const Spacer = () => {
  return (
    <span className="spacer">/</span>
  )
}

/*
const Root = () => {
  return (
    <Link to="/">org</Link>
  )
}
*/

const CrumbNav = ({path, items, siblings}) => {
  if (!items) {
    return null
  }

  console.log(path)
  console.log(siblings)
  const deepDir = siblings && path.split("/").length > 4;

  let mySiblings = siblings.slice();
  let myItems = items.slice()
  if (deepDir) {
    myItems.pop()
  }

  return (
    <nav className="crumbs">
      <CrumbList links={myItems} />
      { (deepDir) &&
        <SiblingList links={mySiblings} />
      }
      { (isText(path))  &&
        <>
          <Spacer />
          <CrumbLink href={path} name={basename(path)} />
        </>
      }
    </nav>
  )
}

const CrumbList = ({links}) => {
  if (!links) {
    return null
  }
  return (
    links.map((l, i) => (
      <span key={i}>
      { i > 0 &&
        <Spacer />
      }
        <CrumbLink key={i} href={l.href} name={l.name} />
      </span>
    ))
  )
}

const SiblingList = ({links}) => {
  if (!links) {
    return null
  }
  return (
    <>
      <Spacer />
      <nav className="siblings">
        { links.map((l, i) => (
          <CrumbLink key={i} href={l.href} name={l.name} isActive={l.active} />
        )) }
      </nav>
    </>
  )
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

export default CrumbNav;
