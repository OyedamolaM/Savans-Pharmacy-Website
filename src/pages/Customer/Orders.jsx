import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err.response || err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (!orders.length) return <p>You have no orders yet.</p>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} style={{ border: "1px solid #e5e5e5", padding: "15px", marginBottom: "15px", borderRadius: "8px" }}>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ₦{order.total}</p>
          <div style={{ marginTop: "10px" }}>
            <h4>Products:</h4>
            {order.products.map((p) => (
              <div key={p.product._id} style={{ marginBottom: "5px" }}>
                {p.product.title} x {p.quantity} = ₦{p.product.price * p.quantity}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
