import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation, useHistory } from 'react-router-dom';
import { DirView, FileSwitch } from './components/files';
import Top from './components/top';

const App = () => {
  return (
    <Router>
      <View />
    </Router>
  )
}

export default App;

const emptyView = (path) => {
  return {
    file:   {
      path: "",
      type: ( path.includes(".") ? "text" : "dir" )
    },
    neighbors: [],
    switch: "",
    parent: "",
  }
}

const View = () => {
  const path = useLocation().pathname;
  const history = useHistory();

  const [view, setView] = useState(emptyView(path));
  const [notFound, setNotFound] = useState(false);

  const loadView = (history, path) => {
    if (path === "/today") {
      fetch("/api/today").then(
        resp => (
          resp.text().then( newPath =>
            history.push(newPath)
          )
        )
      );
    }

    fetch("/api" + path).then(
      resp => {
        if (!resp.ok) {
          setNotFound(true);
          return;
        }
        resp.json().then(view => {
          setView(view)
        })
      }
    ).catch( err => {
        console.log(err)
        return null
    })
  }

  useEffect(() => {
    loadView(history, path);
  }, [history, path]);

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

const Main = ({view}) => {
  switch (view.file.type) {
    case "text":
      return <Single view={view} />
    case "dir":
      return <DirView view={view} />
    default:
      return null
  }
}

const Single = ({view}) => {
  return (
    <>
      <FileSwitch file={view.file} single={true} />
    </>
  )
}


