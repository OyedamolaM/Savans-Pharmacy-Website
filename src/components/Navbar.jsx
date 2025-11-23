import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.scss';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">Savans Pharmacy</Link>
      </div>
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/consultations">Consultations</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/cart">Cart</Link></li>
      </ul>
      <div
        className={`hamburger ${menuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default Navbar;
