import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { basename } from 'path';
import Breadcrumbs from './breadcrumbs';
import { Del } from './info';

const DirName = () => {
  const name = basename(useLocation().pathname);
  if (name === "") {
    return "org"
  }
  return name
}

const Root = () => {
  return (
    <Link to="/">org</Link>
  )
}

const Top = ({view}) => {
  return (
    <>
      <nav>
        <Root />
        <Breadcrumbs />
        <span className="right">
          <Del file={view.file} />
        </span>
      </nav>
      <h1>
        <Link to={view.parent}>^</Link>
        <DirName />
      </h1>
    </>
  )
}

export default Top;
