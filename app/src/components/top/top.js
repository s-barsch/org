import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ThemeIcon from '@material-ui/icons/WbSunnySharp';
import TargetIcon from '@material-ui/icons/VerticalAlignBottom';
import { basename, dirname } from 'path';
import CrumbNav from './crumbs';
import { Del } from '../meta';
import { extendedBase, section } from '../../funcs/paths';
import { TargetsContext } from '../../targets';

const DirName = (path) => {
  const name = basename(path);
  if (name === "") {
    return "org"
  }
  return name
}

/*
const PageTitle = path => {
  if (path === "/") {
    return "ORG"
  }
  return DirName(path) + " - ORG";
}
*/

/*
const makeSiblingsList = files => {
  if (!files) {
    return [];
  }
  let nu = [];
  for (const f of files) {
    if (f.type === "dir") {
      nu.push(f.path);
    }
  }
  return nu;
}
*/

const Top = ({pathname, view}) => {
  const { targetList, activeTarget, removeTarget, setActiveTarget } = useContext(TargetsContext);

  /* theme */

  const [darkTheme, setDarkTheme] = useState(readStateBool("dark-theme"));

  useEffect(() => {
    darkTheme
      ? document.body.dataset["theme"] = "dark"
      : document.body.dataset["theme"] = ""
  })

  function toggleTheme() {
    setDarkTheme(!darkTheme);
    localStorage.setItem("dark-theme", !darkTheme);
  }

   const TargetButton = ({clickFn}) => {
    return <button onClick={clickFn}><TargetIcon /></button>
  }

  const setThisActive = () => {
    setActiveTarget(view.path);
  }

  /* path */

  /*
  const [path, setPath] = useState(view.path);

  useEffect(() => {
    setPath(view.file.path);
  }, [view]);

  document.title = PageTitle(path);
  */

  const history = useHistory();

  async function renameFile(newPath) {
    try {
      const resp = await fetch("/api/move" + view.path, {
        method: "POST",
        body: newPath
      });
      if (!resp.ok) {
        alert( "Rename failed: " + view.path + "\nreason: " +resp.statusText);
        return;
      }
      history.push(newPath)
    } catch(err) {
      console.log(err);
    }
  }

  async function deleteFile(path) {
    try {
      const resp = await fetch("/api/delete" + path);
      if (!resp.ok) {
        alert( "Delete failed: " + path + "\nreason: " +resp.statusText);
        return;
      }
      history.push(view.parent);
    } catch(err) {
      console.log(err);
    }
  }

  console.log(view.nav);

  return (
    <>
      <nav id="links">
        <span className="links__top">
          <LinkList links={view.links} />
        </span>
        <span className="right">
          <TargetButton clickFn={setThisActive} />
          <button onClick={toggleTheme} ><ThemeIcon /></button>
          <Del file={view.file} deleteFile={deleteFile} />
        </span>
      </nav>
    {/* 
          */}
      <nav id="bar">
        <CrumbNav path={pathname} nav={view.nav}/>
        <span className="right">
          <TargetList
            links={targetList}
            page={view.path}
            activeTarget={activeTarget}
            setActiveFn={setActiveTarget}
            removeFn={removeTarget} />
        </span>
      </nav>

      <h1 className="name">
        <Link className="parent" to={dirname(view.path)}>^</Link>
        <RenameInput path={pathname} renameFile={renameFile} />
      </h1>
    </>
  )
}

const RenameInput = ({path, renameFile}) => {
  const [name, setName] = useState(DirName(path));

  useEffect(() => {
    setName(basename(path));
  }, [path]);

  function handleTyping(evt) {
    setName(evt.target.value);
  }

  function submit() {
    const old = DirName(path);
    if (old === name) {
      return;
    }
    const dir = dirname(path);
    renameFile(dir + (dir === "/" ? "" : "/") + name);
  }

  return (
    <input type="text" value={name} size={name.length}
      disabled={name === "org" ? "disabled" : ""}
      onChange={handleTyping} onBlur={submit} />
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
    <span id="targets">
    { links.map((l, i) => {
        let className = section(l)
        if (activeTarget === l) {
          className += " active"
        }
        return (
          <Link key={i} to={l}
          className={className}
          onClick={onClick} onContextMenu={onRightClick}>
            {extendedBase(l)}
          </Link>
        )
      })
    }
    </span>
  )
}

const LinkList = ({links, active}) => {
  if (!links || links.length === 0) {
    return null;
  }
  return (
    links.map((l, i) => (
      <Link key={i} to={l} className={active === l ? "active" : ""}>{basename(l)}</Link>
    ))
  )
}

export default Top;

const readStateBool = key => {
  const str = localStorage.getItem(key);
  if (str == null) {
    return false;
  }
  return str === "true";
}

