import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import FileView from './components/dir/view';
import Nav from './components/nav/nav';
import TargetsProvider, { TargetsContext } from "./targets";
import { basename } from 'path';
import { section, isText } from './funcs/paths';

function App() {
  return (
    <Router>
      <TargetsProvider>
        <View />
      </TargetsProvider>
    </Router>
  )
}

export default App;

function mockView() {
  return {
    path:   "",
    nav:    {},
    files:  [],
    sorted: false
  }
}

function View() {
  const { activeTarget } = useContext(TargetsContext);
  const path = useLocation().pathname;

  const [view, setView] = useState(mockView(path));
  const [lastPath, setLastPath] = useState("");
  const [notFound, setNotFound] = useState(false);

  async function loadView(path) {
    blinkFavicon(path);
    try {
      console.log("LOAD VIEW");
      const resp = await fetch("/api/view" + path);
      if (!resp.ok) {
        setNotFound(true)
        return;
      }
      setNotFound(false);
      const view = await resp.json();
      setView(view);
      setLastPath(view.path);
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    document.title = pageTitle(path);

    if (path === view.path) {
      return;
    }

    if (isText(path) && view.path !== "") {
      return;
    }

    loadView(path);
  }, [path, view, lastPath]);


  const listenForWrite = useCallback(evt => {
    if (path === activeTarget) {
      loadView(path);
    }
  }, [activeTarget, path]);

  useEffect(() => {
    window.addEventListener('storage', listenForWrite);

    return () => {
      window.removeEventListener('storage', listenForWrite);
    };
  }, [listenForWrite]);

  if (notFound) {
    return "404"
  }

  return (
    <>
      <Nav pathname={path} view={view} />
      <FileView pathname={path} view={view} setView={setView} />
    </>
  )
}

const blinkFavicon = (path) => {
    let favicon = document.querySelector('link[rel="icon"]');
    favicon.href = "/blue.svg";
    setTimeout(() => {
      favicon.href = "/" + section(path) + ".svg";
    }, 100);
}

const pageTitle = path => {
  if (path === "/") {
    return "ORG"
  }
  return basename(path) + " - ORG";
}
