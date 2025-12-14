import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
          <span>E-Commerce</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setOpen(prev => !prev)} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="6" width="18" height="2" fill="currentColor" />
            <rect x="3" y="11" width="18" height="2" fill="currentColor" />
            <rect x="3" y="16" width="18" height="2" fill="currentColor" />
          </svg>
        </button>

        <div ref={menuRef} className={`navbar-menu ${open ? 'open' : ''}`}>
          <Link to="/" className="navbar-link">Trang chủ</Link>
          <Link to="/collections" className="navbar-link">Sản phẩm</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-link navbar-user">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span>{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="navbar-link navbar-logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Đăng nhập</Link>
              <Link to="/register" className="navbar-btn">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
