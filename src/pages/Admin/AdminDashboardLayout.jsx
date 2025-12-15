import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.scss"
//chore

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // optional
      navigate("/login");
    };
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

          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
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
