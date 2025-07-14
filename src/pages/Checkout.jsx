// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import './Checkout.scss';

function Checkout() {
  const { cartItems, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null); // 'login' | 'signup' | null

  const handleCloseModal = () => setActiveModal(null);
  const handleSwitchToLogin = () => setActiveModal('login');
  const handleSwitchToSignup = () => setActiveModal('signup');

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <h2>Login Required</h2>
        <p>You must be logged in to proceed with checkout.</p>
        <div className="button-row">
          <button className="login-btn" onClick={handleSwitchToLogin}>
            Login
          </button>
          <button className="signup-btn" onClick={handleSwitchToSignup}>
            Create Account
          </button>
        </div>

        {activeModal === 'login' && (
          <LoginModal
            onClose={handleCloseModal}
            onSwitchToSignup={handleSwitchToSignup}
          />
        )}

        {activeModal === 'signup' && (
          <SignupModal
            onClose={handleCloseModal}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h2>Checkout Summary</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Checkout Summary</h2>
      <ul className="checkout-items">
        {cartItems.map((item) => {
          const unitPrice = parseFloat(item.price);
          const subtotal = unitPrice * item.quantity;
          return (
            <li key={item.id} className="checkout-item">
              <span className="item-name">{item.name}</span>
              <span className="item-detail">
                ₦{unitPrice.toLocaleString()} × {item.quantity}
              </span>
              <span className="item-subtotal">
                ₦{subtotal.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="checkout-total">
        <h3>Total: ₦{getTotalPrice().toLocaleString()}</h3>
      </div>

      <button
        className="continue-btn"
        onClick={() => navigate('/shipping-payment')}
      >
        Continue to Payment
      </button>
    </div>
  );
}

export default Checkout;
