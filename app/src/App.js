import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import DirListing from './components/files';
import Top from './components/top';
import Filetype from './funcs/filetype';

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
    files: []
  }
}

const View = () => {
  const [view, setView] = useState(emptyView());

  const path = useLocation().pathname;

  const loadView = (path) => {
    fetch("/api" + path).then(
      resp => resp.json().then(view => {
        setView(view)
      })
    ).catch( err => {
        console.log(err)
        return null
    })
  }

  useEffect(() => {
    loadView(path);
  }, [path]);

  return (
    <>
      <Top view={view} />
      <Main view={view} />
    </>
  )
}

const Main = ({view}) => {
  switch (view.file.type) {
    case "":
      return "404";
    case "text":
      return <Single view={view} />
    default:
      return <DirListing files={view.files} />
  }
}

const Single = ({view}) => {
  return (
    <>
      <>File view</>
    </>
  )
}
