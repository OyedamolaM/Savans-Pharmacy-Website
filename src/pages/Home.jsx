import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addToCart, getCart, getProducts } from '../api/api';
import { API_BASE_URL } from '../api/baseUrl';
import './Home.scss';

const CATEGORY_DATA = [
  { label: 'Protein & Fitness', icon: 'M8 7l2-3 2 3-2 3-2-3zm6 1a3 3 0 1 0 6 0a3 3 0 0 0-6 0zm-6 7a4 4 0 1 0 0 8a4 4 0 0 0 0-8zm10 1a3 3 0 1 0 6 0a3 3 0 0 0-6 0z', tone: 'lavender' },
  { label: 'Heart Health', icon: 'M12 21s-7.5-4.6-9.3-8.6C1 8.3 3.2 5 6.7 5c2 0 3.5 1.1 4.3 2.4C11.8 6.1 13.3 5 15.3 5c3.5 0 5.7 3.3 4 7.4C19.5 16.4 12 21 12 21z', tone: 'rose' },
  { label: 'Energy & Focus', icon: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z', tone: 'mint' },
  { label: 'Immune Support', icon: 'M12 2l7 3v6c0 5-3 9-7 11-4-2-7-6-7-11V5l7-3z', tone: 'plum' },
  { label: 'Brain Health', icon: 'M9 6c-2 0-3 2-3 4 0 1 .5 2 1.3 2.7C6.5 13.1 6 14 6 15c0 2 1.5 3 3 3h6c2 0 3-1 3-3 0-1-.5-1.9-1.3-2.3.8-.7 1.3-1.7 1.3-2.7 0-2-1-4-3-4-1 0-2 .5-3 1.3C11 6.5 10 6 9 6z', tone: 'sky' },
  { label: 'Natural & Organic', icon: 'M6 17c6-1 8-7 8-11 4 2 6 6 6 10 0 4-3 6-6 6-4 0-7-2-8-5z', tone: 'leaf' },
];

const STATS = [
  { value: '100%', label: 'Natural' },
  { value: '50K+', label: 'Happy Customers' },
  { value: 'GMP', label: 'Certified' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cartCounts, setCartCounts] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isCustomer = () => localStorage.getItem('role') === 'customer';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refreshCartCounts = async () => {
    if (!isCustomer()) {
      setCartCounts({});
      return;
    }
    try {
      const { data } = await getCart();
      const counts = {};
      data.items?.forEach((item) => {
        if (item.productId) {
          counts[item.productId] = item.quantity;
        }
      });
      setCartCounts(counts);
    } catch (err) {
      // ignore cart count errors for public browsing
    }
  };

  useEffect(() => {
    refreshCartCounts();
    const handleCartUpdate = () => refreshCartCounts();
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextSearch = params.get('search') || '';
    setSearchTerm(nextSearch);
  }, [location.search]);

  const resolveImage = (image) => {
    if (!image) return '/fallback.jpg';
    if (image.startsWith('http')) return image;
    return `${API_BASE_URL}${image}`;
  };

  const handleAddToCart = async (productId) => {
    if (!isCustomer()) {
      setNotice('Cart is available for customer accounts only.');
      setTimeout(() => setNotice(''), 2000);
      return;
    }
    setAddingId(productId);
    setNotice('');
    try {
      const qty = Number(quantities[productId] || 1);
      await addToCart(productId, qty);
      setNotice('Added to cart.');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      if (err.message?.includes('No token')) {
        navigate('/login');
        return;
      }
      setNotice('Could not add to cart. Please try again.');
      console.error(err);
    } finally {
      setAddingId(null);
      setTimeout(() => setNotice(''), 2000);
    }
  };

  const handleQuantityChange = (productId, nextValue) => {
    const value = Math.max(1, Number(nextValue) || 1);
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const filteredProducts = useMemo(() => {
    const byCategory = activeCategory
      ? products.filter((product) =>
          product.category?.toLowerCase().includes(activeCategory.toLowerCase())
        )
      : products;
    if (!searchTerm.trim()) return byCategory;
    const term = searchTerm.trim().toLowerCase();
    return byCategory.filter((product) => {
      const title = product.title?.toLowerCase() || '';
      const desc = product.description?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      return title.includes(term) || desc.includes(term) || category.includes(term);
    });
  }, [products, activeCategory, searchTerm]);

  return (
    <div className="home">
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-text">
          <span className="pill">Premium Quality Supplements</span>
          <h1>
            Fuel Your Body,
            <span>Elevate Your Life</span>
          </h1>
          <p>
            Discover our scientifically-formulated supplements designed to support your
            health, fitness, and wellness goals. Quality you can trust, results you can feel.
          </p>
          <div className="hero-actions">
            <button className="shop-btn">Shop Now</button>
            <button className="learn-btn">Learn More</button>
          </div>
          <div className="hero-stats">
            {STATS.map((stat) => (
              <div className="hero-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-image-frame"></div>
          <img
            src="https://images.unsplash.com/photo-1517964603305-11c0f2c85e62?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="supplements workout"
            className="hero-image"
          />
        </div>
      </section>

      {/* ================= CATEGORIES (Slider for Mobile) ================= */}
      <section className="categories" id="categories">
        <h2>Shop by Category</h2>
        <p>Find the perfect supplements for your specific health and wellness goals</p>
        <div className="category-grid">
          {CATEGORY_DATA.map((category) => {
            const isActive = activeCategory === category.label;
            return (
              <button
                key={category.label}
                type="button"
                className={`category-card tone-${category.tone} ${isActive ? 'active' : ''}`}
                onClick={() =>
                  setActiveCategory((prev) => (prev === category.label ? '' : category.label))
                }
              >
                <span className="category-icon">
                  <svg viewBox="0 0 24 24" role="img" focusable="false">
                    <path d={category.icon} />
                  </svg>
                </span>
                <span className="category-label">{category.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <p>Our most popular supplements, trusted by thousands of customers worldwide</p>

        {loading && <p className="loading">Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.slice(0, 8).map((product, index) => (
              <div className="product-card" key={product._id}>
                {index === 0 && <span className="badge">Best Seller</span>}
                {index === 2 && <span className="badge">New</span>}
                <Link to={`/product/${product._id}`} className="product-link">
                  <img
                    src={resolveImage(product.images?.[0])}
                    alt={product.title}
                  />
                </Link>
                <div className="product-body">
                  <span className="product-category">{product.category || 'Supplements'}</span>
                  <Link to={`/product/${product._id}`} className="product-link">
                    <h3>{product.title}</h3>
                  </Link>
                  <p className="product-desc">
                    {product.description || 'Premium formula crafted to support daily wellness.'}
                  </p>
                  <div className="rating">
                    <span className="stars">
                      <span className="star filled">★</span>
                      <span className="star filled">★</span>
                      <span className="star filled">★</span>
                      <span className="star filled">★</span>
                      <span className="star muted">★</span>
                    </span>
                    <span className="rating-count">({240 + index * 17})</span>
                  </div>
                  <div className="product-footer">
                    <span className="price">₦{product.sellingPrice ?? product.price ?? 0}</span>
                    <button
                      className="add-btn"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={addingId === product._id}
                    >
                      <svg viewBox="0 0 24 24" role="img" focusable="false">
                        <path d="M7 6h14l-2 9H9L7 6zm0 0H4L3 3H1V1h3l1 3" />
                      </svg>
                      {addingId === product._id ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                  {cartCounts[product._id] && (
                    <span className="cart-count-pill">
                      {cartCounts[product._id]} in cart
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
