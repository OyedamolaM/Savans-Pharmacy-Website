import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./adminDashboard.scss";

const AdminDashboardLayout = () => {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin/">Dashboard</Link>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/users">Users</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
