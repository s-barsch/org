import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Files from './components/files';
import Top from './components/top';

const App = () => {

  return (
    <Router>
    <Switch>
    <Route path="/">
      <Top />
      <Files />
      </Route>
    </Switch>
    </Router>
  )
}

export default App;
