import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCart, getCart, removeFromCart, updateCartItem } from '../api/api';
import { API_BASE_URL } from '../api/baseUrl';
import './CartDrawer.scss';

const CartDrawer = ({ open, onClose, onCheckout }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [draftQuantities, setDraftQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const resolveImage = (image) => {
    if (!image) return '/fallback.jpg';
    if (image.startsWith('http')) return image;
    return `${API_BASE_URL}${image}`;
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await getCart();
      setCart(data);
      const nextDrafts = {};
      data.items?.forEach((item) => {
        if (item.productId) {
          nextDrafts[item.productId] = item.quantity;
        }
      });
      setDraftQuantities(nextDrafts);
      setError('');
    } catch (err) {
      setError('Unable to load cart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCart();
    }
  }, [open]);

  const recalcCart = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
    const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return { items, subtotal, itemCount };
  };

  const applyLocalQuantity = (productId, quantity) => {
    const nextItems = cart.items
      .map((item) => {
        if (item.productId !== productId) return item;
        const qty = Math.max(1, quantity);
        return {
          ...item,
          quantity: qty,
          lineTotal: (item.price || 0) * qty,
        };
      })
      .filter((item) => item.quantity > 0);
    setCart((prev) => ({ ...prev, ...recalcCart(nextItems) }));
  };

  const handleQuantityChange = (productId, value) => {
    const nextValue = value === '' ? '' : Math.max(1, Number(value) || 1);
    setDraftQuantities((prev) => ({ ...prev, [productId]: nextValue }));
    if (nextValue !== '') {
      applyLocalQuantity(productId, nextValue);
    }
  };

  const commitQuantity = async (productId, nextValue) => {
    const value = nextValue ?? draftQuantities[productId];
    if (value === '' || value == null) return;
    try {
      const { data } = await updateCartItem(productId, value);
      setCart(data);
      setDraftQuantities((prev) => ({
        ...prev,
        [productId]: data.items?.find((i) => i.productId === productId)?.quantity,
      }));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setError('Could not update cart item.');
    }
  };

  const handleStep = async (productId, nextValue) => {
    const value = Math.max(1, Number(nextValue) || 1);
    setDraftQuantities((prev) => ({ ...prev, [productId]: value }));
    applyLocalQuantity(productId, value);
    await commitQuantity(productId, value);
  };

  const handleRemove = async (productId) => {
    try {
      const { data } = await removeFromCart(productId);
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setError('Could not remove item.');
    }
  };

  const handleClear = async () => {
    try {
      const { data } = await clearCart();
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setError('Could not clear cart.');
    }
  };

  if (!open) return null;

  return (
    <div className="cart-drawer">
      <button type="button" className="cart-drawer__backdrop" onClick={onClose} />
      <aside className="cart-drawer__panel" aria-label="Cart drawer">
        <div className="cart-drawer__header">
          <div>
            <h2>Your Cart</h2>
            <p>Quick review before checkout.</p>
          </div>
          <button type="button" className="text-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {loading && <p className="cart-drawer__status">Loading cart...</p>}
        {error && <p className="cart-drawer__status error">{error}</p>}

        {!loading && cart.items.length === 0 ? (
          <div className="cart-drawer__empty">
            <h3>Your cart is empty</h3>
            <p>Pick something from the shop to get started.</p>
            <button
              className="primary-btn"
              onClick={() => {
                onClose();
                navigate('/');
              }}
            >
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cart.items.map((item) => (
                <div className="cart-drawer__item" key={item.id || item.productId}>
                  <img
                    src={resolveImage(item.product?.images?.[0])}
                    alt={item.product?.title || 'Product'}
                  />
                  <div className="cart-drawer__info">
                    <h4>{item.product?.title || 'Product removed'}</h4>
                    <span className="cart-drawer__price">₦{item.price}</span>
                    <div className="cart-drawer__controls">
                      <div className="qty-control">
                        <button
                          type="button"
                          onClick={() => handleStep(item.productId, item.quantity - 1)}
                          disabled={!item.productId}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={draftQuantities[item.productId] ?? item.quantity}
                          onChange={(event) =>
                            handleQuantityChange(item.productId, event.target.value)
                          }
                          onBlur={() => commitQuantity(item.productId)}
                        />
                        <button
                          type="button"
                          onClick={() => handleStep(item.productId, item.quantity + 1)}
                          disabled={!item.productId}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-btn"
                        onClick={() => handleRemove(item.productId)}
                        disabled={!item.productId}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-drawer__line">
                    ₦{item.lineTotal?.toLocaleString?.() ?? item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__summary">
              <div className="summary-row">
                <span>Items</span>
                <span>{cart.itemCount}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₦{cart.subtotal.toLocaleString()}</span>
              </div>
              <button className="primary-btn" onClick={onCheckout}>
                Proceed to Checkout
              </button>
              <button className="outline-btn" onClick={() => navigate('/cart')}>
                View full cart
              </button>
              <button className="ghost-btn" onClick={handleClear}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
