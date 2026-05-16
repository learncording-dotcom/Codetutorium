import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MirrorViewer from './pages/MirrorViewer';
import SessionManager from './pages/SessionManager';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>📱 Phone Mirror Tool</h1>
          <p>Ethical Hacking & Security Testing Platform</p>
        </header>
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mirror/:sessionId" element={<MirrorViewer />} />
          <Route path="/sessions" element={<SessionManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
