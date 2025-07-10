import React from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products';
import ProductCard from '../components/ProductCard';
import './Home.scss';

function Home() {
  const featured = products.slice(0, 8);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Savans Pharmacy</h1>
          <p>Trusted health care, delivered to your doorstep.</p>
          <Link to="/products" className="shop-now-btn">Shop Now</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                badge: index === 1 || index === 4 ? 'Best Seller' : null
              }}
            />
          ))}
        </div>

        <div className="view-all">
          <Link to="/products" className="view-all-btn">View All Products</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
