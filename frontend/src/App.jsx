// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components from the correct path (assuming src/pages/)
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';             // The Dashboard
import Portfolio from './pages/Portfolio.jsx';   // The Portfolio Manager
import BrowseStocks from './pages/BrowseStocks.jsx'; // The Stock Browser

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login/Landing Page */}
        <Route path="/" element={<Login />} />
        
        {/* Authenticated Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/browse-stocks" element={<BrowseStocks />} />
        
        {/* You can add a 404/Not Found route here if desired */}
        {/* <Route path="*" element={<h1>404 Not Found</h1>} /> */}
      </Routes>
    </Router>
  );
}

export default App;