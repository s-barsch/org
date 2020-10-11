import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import DirView from './components/dir/view';
import { FileSwitch } from './components/dir/files';
import Top from './components/top/top';
import TargetsProvider from "./targets";

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
      type: path.includes(".") ? "text" : "dir"
    },
    neighbors: [],
    switch: "",
    parent: "",
  }
}

async function todayRedirect(history) {
    const resp = await fetch("/api/today");
    const todayPath = resp.text();
    history.push(todayPath)
}

function View() {
  const history = useHistory();
  const path = useLocation().pathname;

  const [view, setView] = useState(mockView(path));
  const [notFound, setNotFound] = useState(false);

  async function loadView(path) {
    try {
      const resp = await fetch("/api" + path);

      if (!resp.ok) {
        setNotFound(true)
        return;
      }

      const view = await resp.json();
      setView(view);

    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    loadView(path);
  }, [path]);

  if (view.path === "/today") {
    todayRedirect(history);
    return;
  }

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


