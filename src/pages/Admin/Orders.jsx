import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.scss";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for creating a new order
  const [newOrder, setNewOrder] = useState({
    products: [{ title: "", price: 0, quantity: 1 }],
    shippingAddress: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      phone: "",
    },
    paymentMethod: "Cash on Delivery",
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = "http://localhost:5000/api/admin/orders";

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(API_URL, axiosConfig);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/${orderId}`,
        { status },
        axiosConfig
      );
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data : order))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update order status");
    }
  };

  // Handle input changes for new order
  const handleNewOrderChange = (e, index, field) => {
    if (field === "products") {
      const updatedProducts = [...newOrder.products];
      updatedProducts[index][e.target.name] = e.target.value;
      setNewOrder({ ...newOrder, products: updatedProducts });
    } else if (field.startsWith("shipping")) {
      const updatedShipping = {
        ...newOrder.shippingAddress,
        [e.target.name]: e.target.value,
      };
      setNewOrder({ ...newOrder, shippingAddress: updatedShipping });
    } else {
      setNewOrder({ ...newOrder, [e.target.name]: e.target.value });
    }
  };

  // Add new product row in create order form
  const addProductRow = () => {
    setNewOrder({
      ...newOrder,
      products: [...newOrder.products, { title: "", price: 0, quantity: 1 }],
    });
  };

  // Create a new order
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    // Prepare products array to include price snapshot
    const productsPayload = newOrder.products.map((p) => ({
      title: p.title,
      price: Number(p.price),
      quantity: Number(p.quantity),
    }));

    try {
      const { data } = await axios.post(
        API_URL,
        { ...newOrder, products: productsPayload },
        axiosConfig
      );
      setOrders([data, ...orders]);
      setNewOrder({
        products: [{ title: "", price: 0, quantity: 1 }],
        shippingAddress: {
          fullName: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          phone: "",
        },
        paymentMethod: "Cash on Delivery",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to create order");
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="orders-container">
      <h2>Create New Order</h2>
      <form onSubmit={handleCreateOrder} className="create-order-form">
        <h3>Products</h3>
        {newOrder.products.map((p, idx) => (
          <div key={idx} className="product-row">
            <input
              type="text"
              name="title"
              placeholder="Product title"
              value={p.title}
              onChange={(e) => handleNewOrderChange(e, idx, "products")}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={p.price}
              onChange={(e) => handleNewOrderChange(e, idx, "products")}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={p.quantity}
              onChange={(e) => handleNewOrderChange(e, idx, "products")}
              min="1"
              required
            />
          </div>
        ))}
        <button type="button" onClick={addProductRow}>
          Add Product
        </button>

        <h3>Shipping Address</h3>
        {Object.entries(newOrder.shippingAddress).map(([key, value]) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key}
            value={value}
            onChange={(e) => handleNewOrderChange(e, null, "shipping")}
            required={key !== "addressLine2"}
          />
        ))}

        <h3>Payment Method</h3>
        <select
          name="paymentMethod"
          value={newOrder.paymentMethod}
          onChange={(e) => handleNewOrderChange(e)}
        >
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="Card">Card</option>
        </select>

        <button type="submit">Create Order</button>
      </form>

      <h2>All Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Products</th>
            <th>Total (₦)</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const total = order.products?.reduce(
              (sum, p) => sum + p.quantity * (p.price || 0),
              0
            );

            return (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : "User removed"}</td>
                <td>
                  {order.products?.map((p, idx) => (
                    <div key={p._id || idx}>
                      {p.title
                        ? `${p.title} x ${p.quantity} (₦${p.price})`
                        : "Product removed"}
                    </div>
                  ))}
                </td>
                <td>₦{total}</td>
                <td>{order.orderStatus}</td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
