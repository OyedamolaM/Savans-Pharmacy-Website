import React from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import "./CheckoutSuccess.scss";

const CheckoutSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const total = location.state?.total;

  return (
    <div className="checkout-success">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order placed successfully</h1>
        <p>Thank you for shopping with Savans Pharmacy.</p>
        {orderId && (
          <p className="success-meta">
            Order ID: <strong>{orderId}</strong>
          </p>
        )}
        {total && (
          <p className="success-meta">
            Total: <strong>₦{Number(total).toLocaleString()}</strong>
          </p>
        )}
        <div className="success-actions">
          <Link className="primary-btn" to="/dashboard/orders">
            View Orders
          </Link>
          {orderId && (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => {
                const token = localStorage.getItem("token");
                axios
                  .get(`http://localhost:5000/api/orders/${orderId}/receipt`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: "blob",
                  })
                  .then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `receipt-${orderId}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  })
                  .catch((err) => {
                    console.error("Failed to download receipt", err);
                  });
              }}
            >
              Download Receipt
            </button>
          )}
          <Link className="ghost-btn" to="/">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
