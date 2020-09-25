import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { basename } from 'path';
import Breadcrumbs from './breadcrumbs';
import Del from './del';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import { readStateBool } from '../funcs/storage';

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

  const [darkTheme, setDarkTheme] = useState(readStateBool("dark-theme"));

  useEffect(() => {
    darkTheme
      ? document.body.dataset["theme"] = "dark"
      : document.body.dataset["theme"] = ""
  })

  /*
  const rename = newName => {
  }
  */

  const history = useHistory();

  const del = path => {
    fetch("/api" + path, {
      method: "DELETE"
    }).then(resp => {
      if (!resp.ok) {
        resp.text().then(
          msg => {
            alert(msg)
            return;
            //throw Error(msg);
          }
        );
        return;
      };
      history.push(view.parent);
    }).catch(err => {
      alert(err);
      console.log(err);
    })
  }

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
    localStorage.setItem("dark-theme", !darkTheme);
  }


  return (
    <>
      <nav className="crumbs">
        <Root />
        <Breadcrumbs />
        <span className="right">
          <button onClick={toggleTheme} ><ThemeIcon /></button>
          <Del file={view.file} delFn={del} />
        </span>
      </nav>
      <h1 className="name">
        <Link className="parent" to={view.parent}>^</Link>
        <DirName />
      </h1>
    </>
  )
}

export default Top;
