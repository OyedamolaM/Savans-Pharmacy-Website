import React, { useState, useContext, useEffect } from 'react';
import products from '../data/products';
import ProductCard from '../components/ProductCard';
import { SearchContext } from '../context/SearchContext';
import './Products.scss';

function Products() {
  const { searchTerm } = useContext(SearchContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const PRODUCTS_PER_PAGE = 12;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="products-page">
      <h2>All Products</h2>

      <div className="product-grid">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="no-results">No products match your search.</p>
        )}
      </div>

      {/* Pagination Numbers */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              className={currentPage === idx + 1 ? 'active' : ''}
              onClick={() => handlePageClick(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button className="back-to-top" onClick={handleBackToTop}>
          ↑ Back to Top
        </button>
      )}
    </div>
  );
}

export default Products;
