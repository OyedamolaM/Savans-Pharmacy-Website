import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import SubscribeModal from "../../components/SubscribeModal";
import "./dashboard.scss";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // optional
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h2>supplements.ng</h2>

        <nav>
          <Link to="/">Back to Store</Link>
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
      <SubscribeModal delayMs={30000} />
    </div>
  );
};

export default DashboardLayout;
