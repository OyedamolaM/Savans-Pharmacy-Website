import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCart } from '../api/api';
import CartDrawer from './CartDrawer';
import './Navbar.scss';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const searchSyncRef = useRef(false);
  const searchTimerRef = useRef(null);
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
  const isUser = role === 'customer';
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setCartOpen(false);
  }, [pathname]);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const nextValue = params.get('search') || '';
    searchSyncRef.current = true;
    setSearchValue(nextValue);
  }, [search]);

  useEffect(() => {
    if (searchSyncRef.current) {
      searchSyncRef.current = false;
      return;
    }
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      const trimmed = searchValue.trim();
      const target = trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/';
      navigate(target);
    }, 350);
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchValue, navigate]);

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

  const handleCartClick = () => {
    if (!isUser) {
      navigate('/login');
      return;
    }
    setCartOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Link to="/">supplements.ng</Link>
        </div>
        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/#categories">Categories</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          {token && isUser && <li><Link to="/cart">Cart</Link></li>}
          {!token && <li><Link to="/login">Login</Link></li>}
          {!token && <li><Link to="/register">Register</Link></li>}
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
                      <Link to="/cart" onClick={() => setAccountOpen(false)}>
                        Cart
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
        <div className="nav-actions">
          <div className="search-pill" role="search">
            <svg viewBox="0 0 24 24" role="img" focusable="false" aria-hidden="true">
              <path d="M11 3a8 8 0 1 1 0 16a8 8 0 0 1 0-16zm0 2a6 6 0 1 0 0 12a6 6 0 0 0 0-12zm9.7 13.3l-3.1-3.1a1 1 0 0 1 1.4-1.4l3.1 3.1a1 1 0 0 1-1.4 1.4z" />
            </svg>
            <input
              type="search"
              placeholder="Search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  navigate(`/?search=${encodeURIComponent(searchValue)}`);
                }
              }}
            />
          </div>
          {isUser && (
            <button
              type="button"
              className="icon-link"
              aria-label="Open cart"
              onClick={handleCartClick}
            >
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M7 6h14l-2 9H9L7 6zm0 0H4L3 3H1V1h3l1 3m5 15a2 2 0 1 0 0 4a2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              <span className="sr-only">Cart</span>
            </button>
          )}
        </div>
        <div
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => navigate('/checkout')}
      />
    </>
  );
};

export default Navbar;
