import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

export default function App() {
  // Using a clear layout indicator: 'register', 'login', or 'dashboard'
  const [currentPage, setCurrentPage] = useState('register');

  return (
    <>
      {currentPage === 'register' && (
        <Register togglePage={() => setCurrentPage('login')} />
      )}
      
      {currentPage === 'login' && (
        <Login 
          togglePage={() => setCurrentPage('register')} 
          onLoginSuccess={() => setCurrentPage('dashboard')} 
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard onLogout={() => setCurrentPage('login')} />
      )}
    </>
  );
}