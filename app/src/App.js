import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import FileView from './components/dir/view';
import Top from './components/top/top';
import TargetsProvider, { TargetsContext } from "./targets";
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
    links:  [],
    files:  [],
    sorted: false
  }
}

function View() {
  const { activeTarget } = useContext(TargetsContext);
  const history = useHistory();
  const path = useLocation().pathname;

  const [view, setView] = useState(mockView(path));
  const [lastPath, setLastPath] = useState("");
  const [notFound, setNotFound] = useState(false);

  async function loadView(path, history) {
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
    if (path === view.path) {
      return;
    }

    if (view.path !== "" && isText(path)) {
      return;
    }

    if (isToday(path)) {
      todayRedirect(history);
      return;
    }

    loadView(path, history);
  }, [path, lastPath, history, view]);


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

  if (notFound) {
    return "404"
  }

  return (
    <>
      <Top pathname={path} view={view} />
      <FileView pathname={path} view={view} setView={setView} />
    </>
  )

  /*
  return (
    <>
      <Top view={view} />
      <Main view={view} />
    </>
  )
  */
}

/*
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

*/

const blinkFavicon = (path) => {
    let favicon = document.querySelector('link[rel="icon"]');
    favicon.href = "/blue.svg";
    setTimeout(() => {
      favicon.href = "/" + section(path) + ".svg";
    }, 100);
}

function isToday(path) {
  return path === "/today";
}

async function todayRedirect(history) {
  const resp = await fetch("/api/today");
  const todayPath = await resp.text();
  history.push(todayPath)
}
