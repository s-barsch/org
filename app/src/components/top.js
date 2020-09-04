import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { basename } from 'path';
import Breadcrumbs from './breadcrumbs';

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

const Top = () => {
  return (
    <>
      <nav>
        <Root />
        <Breadcrumbs />
      </nav>
      <h1>
        <Link to="..">^</Link>
        <DirName />
      </h1>
    </>
  )
}

export default Top;
