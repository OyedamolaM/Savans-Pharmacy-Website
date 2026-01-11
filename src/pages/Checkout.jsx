import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart, createOrder, getCart, getProfile } from "../api/api";
import "./Checkout.scss";

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    paymentMethod: "Cash on Delivery",
  });
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      setCart(data);
      setError("");
    } catch (err) {
      if (err.message?.includes("No token")) {
        navigate("/login");
        return;
      }
      setError("Unable to load checkout details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      const address = data.shippingAddresses?.[0];
      if (address) {
        setForm((prev) => ({
          ...prev,
          fullName: address.fullName || prev.fullName,
          addressLine1: address.addressLine1 || prev.addressLine1,
          addressLine2: address.addressLine2 || prev.addressLine2,
          city: address.city || prev.city,
          state: address.state || prev.state,
          country: address.country || prev.country,
          postalCode: address.postalCode || prev.postalCode,
          phone: address.phone || prev.phone,
        }));
      } else if (data.name || data.phone) {
        setForm((prev) => ({
          ...prev,
          fullName: data.name || prev.fullName,
          phone: data.phone || prev.phone,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const products = cart.items
      .filter((item) => item.productId)
      .map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

    try {
      const { data } = await createOrder({
        products,
        shippingAddress: {
          fullName: form.fullName,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          country: form.country,
          postalCode: form.postalCode,
          phone: form.phone,
        },
        paymentMethod: form.paymentMethod,
      });
      await clearCart();
      window.dispatchEvent(new Event('cart-updated'));
      navigate("/checkout/success", {
        state: { orderId: data?._id, total: cart.subtotal },
      });
    } catch (err) {
      setError("Could not place order. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="checkout-status">Loading checkout...</p>;

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add items to continue to checkout.</p>
          <button className="primary-btn" onClick={() => navigate("/")}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-hero">
        <div>
          <h1>Checkout</h1>
          <p>Confirm your details to complete the order.</p>
        </div>
        <button className="outline-btn" onClick={() => navigate("/cart")}>
          Back to Cart
        </button>
      </header>

      {error && <p className="checkout-status error">{error}</p>}

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Details</h2>
          <div className="form-grid">
            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              name="addressLine1"
              placeholder="Address Line 1"
              value={form.addressLine1}
              onChange={handleChange}
              required
            />
            <input
              name="addressLine2"
              placeholder="Address Line 2"
              value={form.addressLine2}
              onChange={handleChange}
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />
            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
            />
            <input
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              required
            />
            <input
              name="postalCode"
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </div>

          <h2>Payment Method</h2>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="Card">Card</option>
          </select>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.items.map((item) => (
              <div className="summary-item" key={item.id || item.productId}>
                <div>
                  <p>{item.product?.title || "Product"}</p>
                  <span>{item.quantity} x ₦{item.price}</span>
                </div>
                <strong>₦{item.lineTotal}</strong>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Subtotal</span>
            <strong>₦{cart.subtotal.toLocaleString()}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
