import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        {children || <Outlet />}
      </main>
      <footer className="layout-footer">
        <div className="footer-content">
          <p className="footer-text">
            © {new Date().getFullYear()} N-Queens Challenge. Crafted with passion for puzzle enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
