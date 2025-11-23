import React, { useEffect, useState } from 'react';
import { getProducts } from '../api/api';
import './Home.scss';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                <button className="add-btn">Add to Cart</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
