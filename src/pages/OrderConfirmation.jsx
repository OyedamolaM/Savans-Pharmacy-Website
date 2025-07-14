// src/pages/OrderConfirmation.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './OrderConfirmation.scss';

function OrderConfirmation() {
  return (
    <div className="order-confirmation">
      <h2>🎉 Order Successful!</h2>
      <p>Your order has been placed and is being processed.</p>
      <Link to="/orders" className="order-link">
        View Your Orders
      </Link>
      <Link to="/" className="home-link">
        Back to Homepage
      </Link>
    </div>
  );
}

export default OrderConfirmation;
