import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem
} from '../api/api';
import './Cart.scss';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [draftQuantities, setDraftQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
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
      if (err.message?.includes('No token')) {
        navigate('/login');
        return;
      }
      setError('Unable to load cart right now.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const recalcCart = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
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

  const handleQuantityInputChange = (productId, value) => {
    const nextValue = value === "" ? "" : Math.max(1, Number(value) || 1);
    setDraftQuantities((prev) => ({ ...prev, [productId]: nextValue }));
    if (nextValue !== "") {
      applyLocalQuantity(productId, nextValue);
    }
  };

  const commitQuantity = async (productId, nextValue) => {
    const value = nextValue ?? draftQuantities[productId];
    if (value === "" || value == null) return;
    try {
      const { data } = await updateCartItem(productId, value);
      setCart(data);
      setDraftQuantities((prev) => ({
        ...prev,
        [productId]: data.items?.find((i) => i.productId === productId)
          ?.quantity,
      }));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setError('Could not update cart item.');
      console.error(err);
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
      console.error(err);
    }
  };

  const handleClear = async () => {
    try {
      const { data } = await clearCart();
      setCart(data);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      setError('Could not clear cart.');
      console.error(err);
    }
  };

  if (loading) return <p className="cart-status">Loading cart...</p>;

  return (
    <div className="cart-page">
      <header className="cart-hero">
        <div>
          <h1>Your Cart</h1>
          <p>Review items, adjust quantities, and proceed to checkout.</p>
        </div>
        <button className="outline-btn" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </header>

      {error && <p className="cart-status error">{error}</p>}

      {cart.items.length === 0 ? (
        <div className="cart-empty">
          <h2>Cart is empty</h2>
          <p>Start adding items to build your order.</p>
          <button className="primary-btn" onClick={() => navigate('/')}>
            Explore Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cart.items.map((item) => (
              <div className="cart-item" key={item.id || item.productId}>
                <img
                  src={item.product?.images?.[0] || '/fallback.jpg'}
                  alt={item.product?.title || 'Product'}
                />
                <div className="item-info">
                  <h3>{item.product?.title || 'Product removed'}</h3>
                  <p className="item-price">₦{item.price}</p>
                  <div className="item-actions">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() =>
                          handleStep(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        disabled={!item.productId}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={
                          draftQuantities[item.productId] ?? item.quantity
                        }
                        onChange={(e) =>
                          handleQuantityInputChange(
                            item.productId,
                            e.target.value
                          )
                        }
                        onBlur={() => commitQuantity(item.productId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitQuantity(item.productId);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleStep(
                            item.productId,
                            item.quantity + 1
                          )
                        }
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
                <div className="line-total">
                  ₦{item.lineTotal?.toLocaleString?.() ?? item.price * item.quantity}
                </div>
              </div>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Items</span>
              <span>{cart.itemCount}</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{cart.subtotal.toLocaleString()}</span>
            </div>
            <button
              className="primary-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
            <button className="ghost-btn" onClick={handleClear}>
              Clear Cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
