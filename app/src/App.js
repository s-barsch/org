import React from 'react';
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

const ViewSwitch = () => {
  const path = useLocation().pathname;
  switch (Filetype(path)) {
    case "text":
      return <Single />
    default:
      return <Dir />
  }
}

const Dir = () => {
  return (
    <>
      <Top />
      <DirView />
    </>
  )
}

const Single = () => {
  return (
    <>
      <Top />
      <>File view</>
    </>
  )
}


