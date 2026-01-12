import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addShippingAddress, clearCart, createOrder, getCart, getProfile } from "../api/api";
import "./Checkout.scss";

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [makeDefault, setMakeDefault] = useState(true);
  const [addressDraft, setAddressDraft] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
  });
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
      setAddresses(data.shippingAddresses || []);
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

  const openAddressModal = () => {
    setAddressDraft({
      fullName: form.fullName,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      state: form.state,
      country: form.country,
      postalCode: form.postalCode,
      phone: form.phone,
    });
    setSaveForFuture(true);
    setMakeDefault(true);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError("");
    setForm((prev) => ({ ...prev, ...addressDraft }));

    if (saveForFuture) {
      try {
        const { data } = await addShippingAddress({
          ...addressDraft,
          saveAsNew: true,
          makeDefault,
        });
        setAddresses(data || []);
      } catch (err) {
        console.error("Failed to save shipping address:", err);
      }
    }

    setShowAddressModal(false);
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
      if (!form.fullName || !form.addressLine1 || !form.city || !form.state || !form.country || !form.postalCode || !form.phone) {
        setError("Please add a delivery address before placing the order.");
        setSubmitting(false);
        return;
      }

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
          {form.addressLine1 ? (
            <div className="checkout-address-card">
              <strong>{form.fullName}</strong>
              <span>{form.addressLine1} {form.addressLine2}</span>
              <span>{form.city}, {form.state}, {form.country} - {form.postalCode}</span>
              <span>Phone: {form.phone}</span>
            </div>
          ) : (
            <p className="checkout-status">No delivery address yet.</p>
          )}
          {addresses.length > 1 && (
            <div className="checkout-address-list">
              {addresses.map((addr) => (
                <label key={addr._id} className="checkout-radio">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={addr.addressLine1 === form.addressLine1 && addr.postalCode === form.postalCode}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        fullName: addr.fullName,
                        addressLine1: addr.addressLine1,
                        addressLine2: addr.addressLine2,
                        city: addr.city,
                        state: addr.state,
                        country: addr.country,
                        postalCode: addr.postalCode,
                        phone: addr.phone,
                      }))
                    }
                  />
                  <span>
                    {addr.addressLine1}, {addr.city} ({addr.phone})
                  </span>
                </label>
              ))}
            </div>
          )}
          <button type="button" className="outline-btn checkout-address-btn" onClick={openAddressModal}>
            Add or change address
          </button>

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

      {showAddressModal && (
        <div className="checkout-modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <h3>Add delivery address</h3>
              <button
                type="button"
                className="checkout-modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                ✕
              </button>
            </div>
            <form className="checkout-modal-body" onSubmit={handleSaveAddress}>
              <div className="form-grid">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={addressDraft.fullName}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={addressDraft.phone}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                />
                <input
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={addressDraft.addressLine1}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, addressLine1: e.target.value }))
                  }
                  required
                />
                <input
                  name="addressLine2"
                  placeholder="Address Line 2"
                  value={addressDraft.addressLine2}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, addressLine2: e.target.value }))
                  }
                />
                <input
                  name="city"
                  placeholder="City"
                  value={addressDraft.city}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, city: e.target.value }))
                  }
                  required
                />
                <input
                  name="state"
                  placeholder="State"
                  value={addressDraft.state}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, state: e.target.value }))
                  }
                  required
                />
                <input
                  name="country"
                  placeholder="Country"
                  value={addressDraft.country}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, country: e.target.value }))
                  }
                  required
                />
                <input
                  name="postalCode"
                  placeholder="Postal Code"
                  value={addressDraft.postalCode}
                  onChange={(e) =>
                    setAddressDraft((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                  required
                />
              </div>
              <label className="checkout-toggle">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                />
                Save address to my account
              </label>
              <label className="checkout-toggle">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                />
                Set as default address
              </label>
              <div className="checkout-modal-actions">
                <button type="button" className="outline-btn" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
