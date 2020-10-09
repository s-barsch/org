import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { basename } from 'path';
import Breadcrumbs from './breadcrumbs';
import Del from './del';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import TargetIcon from '@material-ui/icons/VerticalAlignBottom';
import { readStateBool } from '../funcs/storage';
import * as p from '../funcs/paths';
import * as t from '../funcs/targets';

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
  const [targetList, setTargetList] = useState([]);
  const [targetFolder, setTargetFolder] = useState(false);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    darkTheme
      ? document.body.dataset["theme"] = "dark"
      : document.body.dataset["theme"] = ""
  })

  useEffect(() => {
    fetch("/api/links").then(
      resp => resp.json().then(
        links => setLinks(links)
      )
    )
  }, [])

  useEffect(() => {
    setTargetFolder(t.isTarget(view.file.path));
  }, [view])


  useEffect(() => {
    loadTargets();
  }, [])

  const loadTargets = () => {
    setTargetList(t.getTargetList())
  }

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

  const setTarget = path => {
    if (!targetFolder) {
      t.addTarget(path);
    } else {
      t.removeTarget(path);
    }
    setTargetFolder(!targetFolder);
    loadTargets();
  }

  const TargetButton = () => {
    const clickFn = () => {
      setTarget(view.file.path)
    }
    return (
      <button className={targetFolder ? "active" : ""} onClick={clickFn}>
        <TargetIcon />
      </button>
    )
  }

  return (
    <>
      <nav id="links">
        <LinkList links={links} />
      <span className="right">
        <LinkList links={targetList} />
      </span>
      </nav>

      <nav className="crumbs">
        <Root />
        <Breadcrumbs />
        <span className="right">
          <TargetButton />
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

const LinkList = ({links}) => {
  return (
    links.map((l, i) => (
      <Link key={i} to={l}>{p.ExtendedBase(l)}</Link>
    ))
  )
}

export default Top;
