import React, { useState, useEffect } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { basename } from 'path';
import Breadcrumbs from './breadcrumbs';
import Del from './del';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import TargetIcon from '@material-ui/icons/VerticalAlignBottom';
import { readStateBool } from '../funcs/storage';
import * as p from '../funcs/paths';
import * as targets from '../funcs/targets';

const DirName = ({path}) => {
  const name = basename(path);
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
  const [activeTarget, setActiveTarget] = useState("");
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

  const loadTargets = () => {
    setActiveTarget(targets.getActive());
    setTargetList(targets.getList())
  }

  let location = useLocation();

  useEffect(() => {
    loadTargets();
  }, [])

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

  const setActive = path => {
    targets.setActive(path);
    loadTargets();
  }

  const removeTarget = path => {
    targets.removeTarget(path);
    loadTargets();
  }

  const setThisActive = () => {
    targets.setActive(view.file.path);
    loadTargets();
  }

  const TargetButton = ({clickFn}) => {
    return <button onClick={clickFn}><TargetIcon /></button>
  }

  return (
    <>
      <nav id="links">
        <LinkList links={links} />
      <span className="right">
    <TargetList
    links={targetList}
    page={location.pathname}
    activeTarget={activeTarget}
    setActiveFn={setActive}
    removeFn={removeTarget} />
      </span>
      </nav>

      <nav className="crumbs">
        <Root />
        <Breadcrumbs />
        <span className="right">
          <TargetButton clickFn={setThisActive} />
          <button onClick={toggleTheme} ><ThemeIcon /></button>
          <Del file={view.file} delFn={del} />
        </span>
      </nav>

      <h1 className="name">
        <Link className="parent" to={view.parent}>^</Link>
        <DirName path={location.pathname} />
      </h1>
    </>
  )
}

const TargetList = ({activeTarget, page, links, removeFn, setActiveFn}) => {
  const onClick = evt => {
    if (evt.shiftKey) {
      evt.preventDefault();
      setActiveFn(evt.target.pathname);
    }
  }
  const onRightClick = evt => {
    if (evt.shiftKey) {
      evt.preventDefault();
      removeFn(evt.target.pathname);
    }
  }
  return (
    links.map((l, i) => {
      let className = ""
      if (page === l) {
        className = "current"
      }
      if (activeTarget === l) {
        className = "active"
      }
      if (page === l && activeTarget === l) {
        className = "active--page"
      }
      return (
        <Link key={i} to={l}
        className={className}
        onClick={onClick} onContextMenu={onRightClick}>
          {p.ExtendedBase(l)}
        </Link>
      )
    })
  )
}

const LinkList = ({links}) => {
  return (
    links.map((l, i) => (
      <Link key={i} to={l}>{p.Base(l)}</Link>
    ))
  )
}

export default Top;
