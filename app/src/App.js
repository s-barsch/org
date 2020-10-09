import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { DirListing, FileSwitch } from './components/files';
import Top from './components/top';
//import Filetype from './funcs/filetype';

const App = () => {
  return (
    <Router>
      <View />
    </Router>
  )
}

export default App;

const emptyView = () => {
  return {
    file:   {
      path: "",
      type: ""
    },
    parent: "",
  }
}

const View = () => {
  const [view, setView] = useState(emptyView());
  const [notFound, setNotFound] = useState(false);

  const path = useLocation().pathname;

  const loadView = (path) => {
    fetch("/api" + path).then(
      resp => {
        if (!resp.ok) {
          setNotFound(true);
          return;
        }
        resp.json().then(view => {
          console.log(view);
          setView(view)
        })
      }
    ).catch( err => {
        console.log(err)
        return null
    })
  }

  useEffect(() => {
    loadView(path);
  }, [path]);

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
      return <DirListing view={view} />
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


