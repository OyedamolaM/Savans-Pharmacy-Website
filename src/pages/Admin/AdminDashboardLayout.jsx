import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Admindashboard.scss"
//chore

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // optional
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      navigate("/login");
    };
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <Link to="/admin/">Dashboard</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/customers">Customers</Link>
          <Link to="/admin/staff">Staff</Link>
          <Link to="/admin/branches">Branches</Link>
          <Link to="/admin/inventory">Inventory</Link>
          <Link to="/admin/activity">Activity</Link>
          <Link to="/">View Store</Link>

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
