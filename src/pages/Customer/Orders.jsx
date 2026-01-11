import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Account.scss";

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

  if (loading) return <p className="account-muted">Loading your orders...</p>;
  if (!orders.length) return <p className="account-muted">You have no orders yet.</p>;

  return (
    <div className="account-section">
      <h2>My Orders</h2>
      <div className="account-grid">
        {orders.map((order) => {
          const status = order.orderStatus || order.status;
          const total = order.totalPrice || order.total;
          const itemCount = order.products?.reduce(
            (sum, p) => sum + (p.quantity || 0),
            0
          );
          const resolveImage = (imageUrl) => {
            if (!imageUrl) return "/fallback.jpg";
            if (imageUrl.startsWith("http")) return imageUrl;
            return `http://localhost:5000${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
          };
          const handlePrint = () => {
            const token = localStorage.getItem("token");
            axios
              .get(`http://localhost:5000/api/orders/${order._id}/receipt`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
              })
              .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `receipt-${order._id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
              })
              .catch((err) => {
                console.error("Failed to download receipt", err);
              });
          };

          return (
            <div key={order._id} className="account-card order-card">
              <div className="order-summary">
                <span><strong>Items:</strong> {itemCount}</span>
                <span><strong>Status:</strong> {status}</span>
                <span><strong>Total:</strong> ₦{total}</span>
                <button type="button" className="account-btn" onClick={handlePrint}>
                  Download Receipt
                </button>
              </div>
              <div className="order-products">
                <h4>Items</h4>
                {order.products.map((p, idx) => {
                  const title = p.product?.title || p.title || "Product";
                  const price = p.product?.price || p.price || 0;
                  const image = resolveImage(p.product?.images?.[0]);
                  return (
                    <div key={p.product?._id || idx} className="order-product">
                      <div className="order-product-info">
                        <img
                          src={image || "/fallback.jpg"}
                          alt={title}
                        />
                        <span>{title}</span>
                      </div>
                      <span>{p.quantity} x ₦{price}</span>
                      <strong>₦{price * p.quantity}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="order-meta">
                <span><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</span>
                <span className="order-id">Order ID: {order._id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
