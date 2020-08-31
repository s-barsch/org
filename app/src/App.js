import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Files from './components/files';

const App = () => {
  return (
    <Router>
    <Switch>
    <Route path="/">
        <Link to="..">^</Link>
        <Files />
      </Route>
    </Switch>
    </Router>
  )
}

export default App;
