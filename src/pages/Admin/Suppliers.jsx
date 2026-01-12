import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Suppliers.scss";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    paymentTerms: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    notes: "",
    branchId: "",
  });

  const role = localStorage.getItem("role");
  const canAccess = ["super_admin", "admin", "inventory_manager", "branch_manager", "accountant"].includes(role);
  const canManage = canAccess;
  const canDelete = ["super_admin", "admin"].includes(role);
  const canSelectBranch = ["super_admin", "admin"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const sortedSuppliers = useMemo(
    () => [...suppliers].sort((a, b) => a.name.localeCompare(b.name)),
    [suppliers]
  );

  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      paymentTerms: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
      notes: "",
      branchId: branches[0]?._id || "",
    });
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/suppliers`, axiosConfig);
      setSuppliers(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (!canSelectBranch) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/branches`, axiosConfig);
      setBranches(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (canSelectBranch && branches.length && !formData.branchId) {
      setFormData((prev) => ({ ...prev, branchId: branches[0]._id }));
    }
  }, [branches, canSelectBranch, formData.branchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      contactName: supplier.contactName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      paymentTerms: supplier.paymentTerms || "",
      bankName: supplier.bankName || "",
      accountName: supplier.accountName || "",
      accountNumber: supplier.accountNumber || "",
      notes: supplier.notes || "",
      branchId: supplier.branch || branches[0]?._id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (supplierId) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/suppliers/${supplierId}`, axiosConfig);
      setSuppliers((prev) => prev.filter((supplier) => supplier._id !== supplierId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete supplier");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Supplier name is required");
      return;
    }
    try {
      const payload = { ...formData };
      if (!canSelectBranch) {
        delete payload.branchId;
      }

      if (editingSupplier) {
        const { data } = await axios.put(
          `${API_BASE_URL}/api/suppliers/${editingSupplier._id}`,
          payload,
          axiosConfig
        );
        setSuppliers((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      } else {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/suppliers`,
          payload,
          axiosConfig
        );
        setSuppliers((prev) => [...prev, data]);
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
      resetForm();
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to save supplier");
    }
  };

  if (!canAccess) return <p>You do not have access to suppliers.</p>;
  if (loading) return <p>Loading suppliers...</p>;

  return (
    <div className="suppliers-page">
      <div className="suppliers-header">
        <h2>Suppliers</h2>
        {canManage && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setEditingSupplier(null);
              resetForm();
              setIsModalOpen(true);
            }}
          >
            New Supplier
          </button>
        )}
      </div>

      {error && <p className="suppliers-error">{error}</p>}

      <div className="suppliers-table">
        <div className="suppliers-row header">
          <span>Name</span>
          <span>Contact</span>
          <span>Phone</span>
          <span>Balance</span>
          <span>Actions</span>
        </div>
        {sortedSuppliers.map((supplier) => (
          <div key={supplier._id} className="suppliers-row">
            <span>{supplier.name}</span>
            <span>{supplier.contactName || "-"}</span>
            <span>{supplier.phone || "-"}</span>
            <span>₦{Number(supplier.balance || 0).toLocaleString()}</span>
            <span className="row-actions">
              {canManage && (
                <button type="button" className="ghost-button" onClick={() => handleEdit(supplier)}>
                  Edit
                </button>
              )}
              {canDelete && (
                <button type="button" className="danger-button" onClick={() => handleDelete(supplier._id)}>
                  Delete
                </button>
              )}
            </span>
          </div>
        ))}
        {sortedSuppliers.length === 0 && (
          <p className="muted">No suppliers yet.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSupplier ? "Edit Supplier" : "New Supplier"}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} type="button">
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="full-width">
                  Supplier Name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Contact Name
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    placeholder="+234..."
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>
                <label className="full-width">
                  Address
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Payment Terms
                  <input
                    type="text"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Bank Name
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Account Name
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Account Number
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                </label>
                {canSelectBranch && (
                  <label>
                    Branch
                    <select
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleChange}
                    >
                      <option value="">Shared</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit">{editingSupplier ? "Save Supplier" : "Create Supplier"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
