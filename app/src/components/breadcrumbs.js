import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Spacer = () => {
  return (
    <span className="spacer">/</span>
  )
}

const Breadcrumbs = () => {
  let path = useLocation().pathname;
  if (path === "/") {
    return null
  }

  const items = path.substr(1).split("/");
  let href = ""
  return (
    items.map((name, i) => {
      href += "/" + name
      return <Crumb key={i} href={href} name={name} />
    })
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


export default Breadcrumbs;
