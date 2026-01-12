import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./AdminHome.scss";

const AdminHome = () => {
  const adminName = localStorage.getItem("name");
  const toTitleCase = (value = "") =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  const token = localStorage.getItem("token");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/admin/analytics`,
          axiosConfig
        );
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      }
    };

    fetchAdminStats();
  }, [axiosConfig]);

  return (
    <div className="admin-home">
      <h2>Admin Overview</h2>
      <p className="admin-subtitle">
        {adminName
          ? `Welcome back, ${toTitleCase(adminName)}.`
          : "Welcome to your admin analytics dashboard."}
      </p>

      <div className="admin-stats">
        <div className="admin-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Customers</p>
        </div>

        <div className="admin-card">
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
        </div>

        <div className="admin-card">
          <h3>{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>

        <div className="admin-card">
          <h3>₦{stats.totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <h3>Recent Orders</h3>

      {stats.recentOrders.length === 0 ? (
        <p className="admin-empty">No recent orders.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user?.name ? toTitleCase(order.user.name) : "-"}</td>
                  <td>{order.user?.phone || "-"}</td>
                  <td>₦{order.totalPrice}</td>
                  <td>{order.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
