import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Spacer = () => {
  return (
    <span class="spacer">/</span>
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
    items.map((e, i) => {
      href += "/" + e
      return (
        <>
          <Spacer />
          <Link to={href}>{e}</Link>
        </>
      )
    })
  )
}


export default Breadcrumbs;
