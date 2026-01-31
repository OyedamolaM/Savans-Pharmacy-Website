import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addToCart, getCart, getProduct } from '../api/api';
import { API_BASE_URL } from '../api/baseUrl';
import './ProductDetail.scss';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(0);

  const isCustomer = () => localStorage.getItem('role') === 'customer';

  const resolveImage = (image) => {
    if (!image) return '/fallback.jpg';
    if (image.startsWith('http')) return image;
    return `${API_BASE_URL}${image}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setNotice('Unable to load product.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const refreshCartCount = async () => {
    if (!isCustomer()) return;
    try {
      const { data } = await getCart();
      const item = data.items?.find((entry) => entry.productId === id);
      setInCart(item?.quantity ?? 0);
    } catch (err) {
      setInCart(0);
    }
  };

  useEffect(() => {
    refreshCartCount();
  }, [id]);

  const handleAdd = async () => {
    if (!isCustomer()) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(id, quantity);
      setNotice('Added to cart.');
      refreshCartCount();
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setNotice('Could not add to cart.');
    } finally {
      setTimeout(() => setNotice(''), 2000);
    }
  };

  if (loading) return <p className="product-detail__status">Loading product...</p>;

  if (!product) return <p className="product-detail__status">{notice || 'Product not found.'}</p>;

  return (
    <div className="product-detail">
      <div className="product-detail__media">
        <img src={resolveImage(product.images?.[0])} alt={product.title} />
      </div>
      <div className="product-detail__content">
        <span className="product-detail__category">
          {product.category || 'Supplements'}
        </span>
        <h1>{product.title}</h1>
        <p className="product-detail__desc">
          {product.description || 'Premium formula crafted to support daily wellness.'}
        </p>
        <div className="product-detail__rating">
          <span className="stars">
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star muted">★</span>
          </span>
          <span className="rating-count">(324)</span>
        </div>
        <div className="product-detail__price">
          ₦{product.sellingPrice ?? product.price ?? 0}
        </div>
        <div className="product-detail__actions">
          <div className="qty-control">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
            />
            <button type="button" onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
          <button className="add-btn" onClick={handleAdd}>
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path d="M7 6h14l-2 9H9L7 6zm0 0H4L3 3H1V1h3l1 3" />
            </svg>
            Add to Cart
          </button>
        </div>
        {inCart > 0 && (
          <span className="cart-count-pill">{inCart} in cart</span>
        )}
        {notice && <p className="product-detail__notice">{notice}</p>}
      </div>
    </div>
  );
};

export default ProductDetail;
