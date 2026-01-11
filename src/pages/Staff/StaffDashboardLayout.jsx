import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Staffdashboard.scss";

const StaffDashboardLayout = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const canSeeActivity = role === "branch_manager";

  return (
    <div className="staff-container">
      <aside className="staff-sidebar">
        <h2>Staff Panel</h2>
        <nav>
          <Link to="/staff">Home</Link>
          <Link to="/staff/orders">Orders</Link>
          <Link to="/staff/customers">Customers</Link>
          <Link to="/staff/inventory">Inventory</Link>
          {canSeeActivity && <Link to="/staff/activity">Activity</Link>}
          <Link to="/">View Store</Link>

          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
};

export default StaffDashboardLayout;
