import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCart } from '../api/api';
import './Navbar.scss';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const toTitleCase = (value = '') =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isStaff = ['branch_manager', 'accountant', 'inventory_manager', 'cashier', 'staff'].includes(role);
  const isUser = role === 'user';
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const refreshCartCount = async () => {
    if (!token || !isUser) return;
    try {
      const { data } = await getCart();
      setCartCount(data.distinctCount ?? data.items?.length ?? 0);
    } catch (err) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, [token, role]);

  useEffect(() => {
    const handleCartUpdate = () => refreshCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setAccountOpen(false);
    navigate('/login');
  };

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
        {!token && <li><Link to="/login">Login</Link></li>}
        {!token && <li><Link to="/register">Register</Link></li>}
        {token && isUser && (
          <>
            <li className="nav-icon">
              <Link to="/cart" className="icon-link" aria-label="Cart">
                <svg viewBox="0 0 24 24" role="img" focusable="false">
                  <path d="M7 6h14l-2 9H9L7 6zm0 0H4L3 3H1V1h3l1 3m5 15a2 2 0 1 0 0 4a2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4" />
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                <span className="sr-only">Cart</span>
              </Link>
            </li>
          </>
        )}
        {token && (
          <li className="nav-account">
            <button
              type="button"
              className="account-button"
              onClick={() => setAccountOpen(!accountOpen)}
              aria-haspopup="menu"
              aria-expanded={accountOpen}
            >
              <span className="account-avatar">
                {name ? name.charAt(0).toUpperCase() : 'A'}
              </span>
              <span className="account-name">
                {name ? toTitleCase(name) : (isAdmin ? 'Admin' : (isStaff ? 'Staff' : 'Account'))}
              </span>
            </button>
            {accountOpen && (
              <div className="account-menu" role="menu">
                {isUser && (
                  <>
                    <Link to="/dashboard" onClick={() => setAccountOpen(false)}>
                      Dashboard
                    </Link>
                    <Link to="/dashboard/profile" onClick={() => setAccountOpen(false)}>
                      Profile
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setAccountOpen(false)}>
                    Admin Console
                  </Link>
                )}
                {isStaff && (
                  <Link to="/staff" onClick={() => setAccountOpen(false)}>
                    Staff Console
                  </Link>
                )}
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </li>
        )}
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
