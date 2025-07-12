import { Link, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { SearchContext } from '../context/SearchContext';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // ✅ NEW
import './Navbar.scss';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { cartItems } = useContext(CartContext);
  const { isAuthenticated, user, logout } = useAuth(); // ✅ NEW
  const navigate = useNavigate();

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      navigate('/products');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Savans Pharmacy</Link>
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKey}
        />
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li>
          <Link to="/cart">
            Cart ({cartItems.length})
          </Link>
        </li>

        {/* 🔒 Show only if logged in */}
        {isAuthenticated ? (
          <>
            <li className="user-email">Hi, {user?.email}</li>
            <li><button className="logout-btn" onClick={logout}>Logout</button></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}

        {/* Mobile-only search */}
        <li className="mobile-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKey}
          />
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
