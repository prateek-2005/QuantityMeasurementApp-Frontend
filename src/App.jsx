import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login    from './components/Login';
import Signup   from './components/Signup';
import Dashboard from './components/Dashboard';

// If no token → redirect to login
function Private({ children }) {
  return localStorage.getItem('jwt_token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
