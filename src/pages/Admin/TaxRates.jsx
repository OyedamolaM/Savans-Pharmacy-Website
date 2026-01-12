import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Inventory.scss";

const TaxRates = () => {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({
    name: "",
    rate: "",
    effectiveFrom: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const canAccess = ["super_admin", "admin", "accountant"].includes(role);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/tax-rates`, axiosConfig);
      setRates(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load tax rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      fetchRates();
    }
  }, [canAccess]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/tax-rates`,
        form,
        axiosConfig
      );
      setRates((prev) => [data, ...prev]);
      setForm({ name: "", rate: "", effectiveFrom: "", isDefault: false });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save tax rate");
    }
  };

  if (!canAccess) return <p>You do not have access to tax settings.</p>;
  if (loading) return <p>Loading tax rates...</p>;

  return (
    <div className="inventory-detail">
      <div className="inventory-toolbar">
        <div>
          <h2>Tax Settings</h2>
          <p className="muted">Manage VAT rates and effective dates.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="inventory-card-panel">
        <h3>Add Tax Rate</h3>
        <form className="inventory-form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Rate (%)
            <input name="rate" type="number" value={form.rate} onChange={handleChange} required />
          </label>
          <label>
            Effective From
            <input name="effectiveFrom" type="date" value={form.effectiveFrom} onChange={handleChange} required />
          </label>
          <label>
            Default
            <input name="isDefault" type="checkbox" checked={form.isDefault} onChange={handleChange} />
          </label>
          <div className="inventory-actions">
            <button type="submit">Save Rate</button>
          </div>
        </form>
      </div>

      <div className="inventory-card-panel">
        <h3>Existing Rates</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rate</th>
              <th>Effective</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate._id}>
                <td>{rate.name}</td>
                <td>{rate.rate}%</td>
                <td>{new Date(rate.effectiveFrom).toLocaleDateString()}</td>
                <td>{rate.isDefault ? "Yes" : "No"}</td>
              </tr>
            ))}
            {rates.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">No tax rates yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxRates;
