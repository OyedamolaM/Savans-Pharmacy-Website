import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./dashboard.scss";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // optional
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2>Savans Account</h2>

        <nav>
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/orders">My Orders</Link>
          <Link to="/dashboard/wishlist">Wishlist</Link>
          <Link to="/dashboard/profile">Profile</Link>
          <Link to="/dashboard/shipping">Shipping Address</Link>

          {/* Logout as a styled link */}
          <button className="sidebar-link" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
