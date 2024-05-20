import React from 'react';
import 'css/main.scss';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TargetsProvider from './context/targets';
import ErrProvider from './context/err';
import Write from 'views/write/write';
import Search from 'views/search/main';
import Today from 'views/today/main';
import Topics, { Topic } from 'views/topics/main';
import { ViewLoader } from 'loader';

export default function App() {
    return (
    <TargetsProvider>
    <ErrProvider>
        <Router>
            <Routes>
                <Route path="/write" element={<Write />} />
                <Route path="/today" element={<Today />} />
                <Route path="/search/*" element={<Search />} />
                <Route path="/topics" element={<Topics />} />
                <Route path="/topics/*" element={<Topic />} />
                <Route path="/*" element={<ViewLoader />} />
            </Routes>
        </Router>
    </ErrProvider>
    </TargetsProvider>
    )
}
