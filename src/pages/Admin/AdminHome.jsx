import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminHome.scss"

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/admin/stats",
          axiosConfig
        );
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Overview</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Welcome to your admin analytics dashboard.
      </p>

      {/* Analytics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div className="admin-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
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

      {/* Recent Orders */}
      <h3>Recent Orders</h3>

      {stats.recentOrders.length === 0 ? (
        <p>No recent orders.</p>
      ) : (
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#eee" }}>
              <th style={{ padding: "10px" }}>Order ID</th>
              <th style={{ padding: "10px" }}>User</th>
              <th style={{ padding: "10px" }}>Amount</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((order) => (
              <tr key={order._id}>
                <td style={{ padding: "10px" }}>{order._id}</td>
                <td style={{ padding: "10px" }}>{order.user?.name}</td>
                <td style={{ padding: "10px" }}>₦{order.totalPrice}</td>
                <td style={{ padding: "10px" }}>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminHome;
