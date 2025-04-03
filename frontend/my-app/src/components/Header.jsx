// src/components/Header.jsx
import React from 'react';
import '../App.css';

function Header() {
  return (
    <header className="header">
      <div className="header-title">
        <h1>CubeSat Ground Station</h1>
      </div>
      <div className="header-actions">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button className="search-button">🔍</button>
        </div>
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <span className="user-name">Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Header;