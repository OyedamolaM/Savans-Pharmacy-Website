import React from "react";
import "./StaffHome.scss";

const StaffHome = () => {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const toTitleCase = (value = "") =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="staff-home">
      <h2>Staff Overview</h2>
      <p className="staff-subtitle">
        {name ? `Welcome back, ${toTitleCase(name)}.` : "Welcome to your staff dashboard."}
      </p>
      <div className="staff-grid">
        <div className="staff-card">
          <h3>Orders</h3>
          <p>Manage customer orders and updates.</p>
        </div>
        <div className="staff-card">
          <h3>Customers</h3>
          <p>View customer profiles and contact details.</p>
        </div>
        <div className="staff-card">
          <h3>Inventory</h3>
          <p>Check stock levels and product details.</p>
        </div>
      </div>
      {role && (
        <p className="staff-role">Role: {role.replace(/_/g, " ")}</p>
      )}
    </div>
  );
};

export default StaffHome;
