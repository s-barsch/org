import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import DirView from './components/files';
import Top from './components/top';
import Filetype from './funcs/filetype';

const App = () => {

  return (
    <Router>
        <ViewSwitch />
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

const ViewSwitch = () => {
  const [view, setView] = useState(emptyView());

  const path = useLocation().pathname;

  const loadView = (path) => {
    fetch("/api" + path).then(
      resp => resp.json().then(vie => {
        setView(vie)
      })
    ).catch( err => {
        console.log(err)
    })
  }

  useEffect(() => {
    loadView(path);
  }, [path]);

  switch (view.file.type) {
    case "text":
      return <Single view={view} />
    default:
      return <Dir view={view} />
  }
}

/*
const Dir = ({view}) => {
  return <FileList files={view.files} />
}

const FileList = ({files}) => {
  console.log(files);
  return (
    files.map((file, i) => (
      <FileEntry key={i} file={file} />
    ))
  );
}

const FileEntry = ({file}) => {
  return (
    <div>x{file.path}</div>
  )
}
*/

const Dir = ({view}) => {
  return (
    <>
      <Top view={view} />
      <DirView files={view.files} />
    </>
  )
}

const Single = ({view}) => {
  return (
    <>
      <Top view={view} />
      <>File view</>
    </>
  )
}
