import React from 'react';
import './App.css';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Files from './components/files';
import Top from './components/top';

const App = () => {

  return (
    <Router>
      <View />
    </Router>
  )
}

export default App;

const View = () => {
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
      <Files />
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

const Filetype = (path) => {
  switch (path.split('.').pop()) {
    case "txt":
      return "text"
    default:
      return "dir"
  }
}
