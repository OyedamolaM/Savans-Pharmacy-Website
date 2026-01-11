import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Account.scss";

const Shipping = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
  });

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/profile",
        axiosConfig
      );
      setAddresses(data.shippingAddresses || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch shipping addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/user/shipping",
        newAddress,
        axiosConfig
      );
      setAddresses(data);
      setNewAddress({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        phone: "",
      });
      setSuccess("Shipping address added!");
    } catch (err) {
      console.error(err);
      setError("Failed to add address");
    }
  };

  // Remove address
  const handleRemoveAddress = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/user/shipping/${id}`,
        axiosConfig
      );
      setAddresses(data);
      setSuccess("Address removed!");
    } catch (err) {
      console.error(err);
      setError("Failed to remove address");
    }
  };

  if (loading) return <p className="account-muted">Loading shipping addresses...</p>;
  if (error) return <p className="account-muted">{error}</p>;

  return (
    <div className="account-section">
      <h2>Shipping Addresses</h2>
      {success && <p className="account-muted">{success}</p>}

      {addresses.length === 0 && <p className="account-muted">No addresses yet.</p>}

      <div className="account-grid">
        {addresses.map((addr) => (
          <div key={addr._id} className="account-card">
            <p>
              {addr.fullName}, {addr.addressLine1} {addr.addressLine2},{" "}
              {addr.city}, {addr.state}, {addr.country} - {addr.postalCode}
            </p>
            <p className="account-muted">Phone: {addr.phone}</p>
            <button className="account-btn" onClick={() => handleRemoveAddress(addr._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <h3>Add New Address</h3>
      <div className="account-card">
        <form onSubmit={handleAddAddress} className="account-form">
          <input
            placeholder="Full Name"
            value={newAddress.fullName}
            onChange={(e) =>
              setNewAddress({ ...newAddress, fullName: e.target.value })
            }
            required
          />
          <input
            placeholder="Address Line 1"
            value={newAddress.addressLine1}
            onChange={(e) =>
              setNewAddress({ ...newAddress, addressLine1: e.target.value })
            }
            required
          />
          <input
            placeholder="Address Line 2"
            value={newAddress.addressLine2}
            onChange={(e) =>
              setNewAddress({ ...newAddress, addressLine2: e.target.value })
            }
          />
          <input
            placeholder="City"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress({ ...newAddress, city: e.target.value })
            }
            required
          />
          <input
            placeholder="State"
            value={newAddress.state}
            onChange={(e) =>
              setNewAddress({ ...newAddress, state: e.target.value })
            }
            required
          />
          <input
            placeholder="Country"
            value={newAddress.country}
            onChange={(e) =>
              setNewAddress({ ...newAddress, country: e.target.value })
            }
            required
          />
          <input
            placeholder="Postal Code"
            value={newAddress.postalCode}
            onChange={(e) =>
              setNewAddress({ ...newAddress, postalCode: e.target.value })
            }
            required
          />
          <input
            placeholder="Phone"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress({ ...newAddress, phone: e.target.value })
            }
            required
          />
          <button type="submit" className="account-btn">Add Address</button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
