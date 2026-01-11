import React from "react";
import { Link } from "react-router-dom";
import "./Account.scss";

const Overview = () => {
  return (
    <div className="account-section">
      <h2>Welcome to your Savans Account</h2>
      <div className="account-card">
        <p className="account-muted">
          Track orders, update your profile, and manage shipping details from
          one place.
        </p>
        <div className="account-grid">
          <Link className="account-btn" to="/dashboard/orders">
            View Orders
          </Link>
          <Link className="account-btn" to="/dashboard/profile">
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Overview;
