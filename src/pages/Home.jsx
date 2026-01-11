import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToCart, getCart, getProducts } from '../api/api';
import './Home.scss';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cartCounts, setCartCounts] = useState({});
  const navigate = useNavigate();

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

  const handleAddToCart = async (productId) => {
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

  return (
    <div className="home">

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Savans Pharmacy</h1>
          <p>Your trusted destination for healthcare, beauty & wellness products.</p>
          <button className="shop-btn">Shop Now</button>
        </div>
        <img src="https://images.unsplash.com/photo-1642055514517-7b52288890ec?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero" className="hero-image" />
      </section>

      {/* ================= CATEGORIES (Slider for Mobile) ================= */}
      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-slider">
          <div className="category-card">Medicine</div>
          <div className="category-card">Supplements</div>
          <div className="category-card">Skincare</div>
          <div className="category-card">Sexual Health</div>
          <div className="category-card">Wellness</div>
          <div className="category-card">Baby Care</div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="featured-products">
        <h2>Featured Products</h2>

        {loading && <p className="loading">Loading products...</p>}
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {products.slice(0, 8).map(product => (
              <div className="product-card" key={product._id}>
                <img
                  src={product.images?.[0] || '/fallback.jpg'}
                  alt={product.title}
                />
                <h3>{product.title}</h3>
                <p className="price">₦{product.price}</p>
                <div className="add-row">
                  <div className="add-controls">
                    <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          product._id,
                          (quantities[product._id] || 1) - 1
                        )
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[product._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product._id, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(
                          product._id,
                          (quantities[product._id] || 1) + 1
                        )
                      }
                    >
                      +
                    </button>
                    </div>
                    <button
                      className="add-btn"
                      onClick={() => handleAddToCart(product._id)}
                      disabled={addingId === product._id}
                    >
                      {addingId === product._id ? 'Adding...' : 'Add to Cart'}
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
