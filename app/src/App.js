import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import DirView from './components/dir/view';
import { FileSwitch } from './components/dir/files';
import Top from './components/top/top';
import TargetsProvider, { TargetsContext } from "./targets";
import { Section } from './funcs/paths';

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

function mockView(path) {
  return {
    file:   {
      path: path,
      type: path.includes(".") ? "text" : "dir",
      body: ""
    },
    parent:   "",
    switch:   "",
    siblings: [],
    files:    [],
    sorted:   false
  }
}

function View() {
  const { activeTarget } = useContext(TargetsContext);
  const history = useHistory();
  const path = useLocation().pathname;

  const [view, setView] = useState(mockView(path));
  const [notFound, setNotFound] = useState(false);

  async function loadView(path, history) {
    if (path === "/today") {
      const resp = await fetch("/api/today");
      const todayPath = await resp.text();
      history.push(todayPath)
      return;
    }
    try {
      let favicon = document.querySelector('link[rel="icon"]');
      favicon.href = "/blue.svg";

      const resp = await fetch("/api/view" + path);

      if (!resp.ok) {
        setNotFound(true)
        return;
      }
      setNotFound(false);

      const view = await resp.json();
      setView(view);
      setTimeout(() => {
        favicon.href = "/" + Section(path) + ".svg";
        console.log("/" + Section(path) + ".svg");
      }, 100);
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    loadView(path, history);
  }, [history, path]);

  const listenForWrite = useCallback(evt => {
    if (path === activeTarget) {
      loadView(path, history);
    }
  }, [activeTarget, path, history]);

  useEffect(() => {
    window.addEventListener('storage', listenForWrite);

    return () => {
      window.removeEventListener('storage', listenForWrite);
    };
  }, [listenForWrite]);

  /*
  if (path === "/today") {
    todayRedirect(history);
    return null;
  }
  */

  if (notFound) {
    return "404"
  }

  return (
    <>
      <Top view={view} />
      <Main view={view} />
    </>
  )
}

function Main({view}) {
  switch (view.file.type) {
    case "text":
      return <Single view={view} />
    case "dir":
      return <DirView view={view} />
    default:
      return null
  }
}

function Single({view}) {
  return (
    <>
      <FileSwitch file={view.file} single={true} />
    </>
  )
}


