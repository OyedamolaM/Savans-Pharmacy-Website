import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./SupplierInvoices.scss";

const SupplierInvoices = ({ defaultCreateOpen = false }) => {
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(defaultCreateOpen);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    supplierId: "",
    branchId: "",
    invoiceNumber: "",
    reference: "",
    dateSupplied: "",
    dueDate: "",
    tax: "",
    notes: "",
    items: [],
    attachments: [],
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Bank Transfer",
    reference: "",
    note: "",
  });

  const role = localStorage.getItem("role");
  const canAccess = ["super_admin", "admin", "inventory_manager", "branch_manager", "accountant"].includes(role);
  const canSelectBranch = ["super_admin", "admin"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const subtotal = useMemo(
    () =>
      invoiceForm.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitCost || 0),
        0
      ),
    [invoiceForm.items]
  );
  const total = subtotal + (Number(invoiceForm.tax) || 0);

  const fetchData = async () => {
    try {
      const [invoiceRes, supplierRes, productRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/supplier-invoices`, axiosConfig),
        axios.get(`${API_BASE_URL}/api/suppliers`, axiosConfig),
        axios.get(`${API_BASE_URL}/api/products`),
      ]);
      setInvoices(invoiceRes.data || []);
      setSuppliers(supplierRes.data || []);
      setProducts(productRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load supplier invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    if (!canSelectBranch) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/branches`, axiosConfig);
      setBranches(data || []);
      if (!invoiceForm.branchId && data?.length) {
        setInvoiceForm((prev) => ({ ...prev, branchId: data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, axiosConfig);
      setCurrentBranch(data.branch || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    fetchData();
    if (canSelectBranch) {
      fetchBranches();
    } else {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (defaultCreateOpen) {
      setIsCreateOpen(true);
    }
  }, [defaultCreateOpen]);

  const handleInvoiceChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setInvoiceForm((prev) => ({ ...prev, attachments: files }));
      return;
    }
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", quantity: 1, unitCost: "" },
      ],
    }));
  };

  const updateItem = (index, field, value) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index) => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((item) => item._id === productId);
    updateItem(index, "productId", productId);
    if (product) {
      updateItem(index, "unitCost", product.costPrice || product.sellingPrice || product.price || "");
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      supplierId: "",
      branchId: branches[0]?._id || "",
      invoiceNumber: "",
      reference: "",
      dateSupplied: "",
      dueDate: "",
      tax: "",
      notes: "",
      items: [],
      attachments: [],
    });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.supplierId) {
      setError("Supplier is required");
      return;
    }
    if (!invoiceForm.dateSupplied) {
      setError("Supply date is required");
      return;
    }
    if (invoiceForm.items.length === 0) {
      setError("Add at least one product line");
      return;
    }
    const invalidItem = invoiceForm.items.find(
      (item) => !item.productId || Number(item.quantity) <= 0
    );
    if (invalidItem) {
      setError("Each line item needs a product and quantity");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("supplierId", invoiceForm.supplierId);
      if (canSelectBranch) {
        formData.append("branchId", invoiceForm.branchId);
      }
      formData.append("invoiceNumber", invoiceForm.invoiceNumber);
      formData.append("reference", invoiceForm.reference);
      formData.append("dateSupplied", invoiceForm.dateSupplied);
      formData.append("dueDate", invoiceForm.dueDate);
      formData.append("tax", invoiceForm.tax || 0);
      formData.append("notes", invoiceForm.notes);
      formData.append("items", JSON.stringify(invoiceForm.items));

      Array.from(invoiceForm.attachments || []).forEach((file) => {
        formData.append("attachments", file);
      });

      const { data } = await axios.post(
        `${API_BASE_URL}/api/supplier-invoices`,
        formData,
        { headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" } }
      );
      setInvoices((prev) => [data, ...prev]);
      setIsCreateOpen(false);
      resetInvoiceForm();
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to create invoice");
    }
  };

  const handleOpenPayment = (invoice) => {
    setActiveInvoice(invoice);
    setPaymentForm({
      amount: "",
      method: "Bank Transfer",
      reference: "",
      note: "",
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!activeInvoice) return;
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/supplier-invoices/${activeInvoice._id}/payments`,
        paymentForm,
        axiosConfig
      );
      setInvoices((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setIsPaymentOpen(false);
      setActiveInvoice(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to record payment");
    }
  };

  if (!canAccess) return <p>You do not have access to invoices.</p>;
  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="supplier-invoices-page">
      <div className="supplier-invoices-header">
        <h2>Supplier Invoices</h2>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            resetInvoiceForm();
            setIsCreateOpen(true);
          }}
        >
          New Invoice
        </button>
      </div>

      {error && <p className="supplier-invoices-error">{error}</p>}

      <div className="invoice-list">
        <div className="invoice-row header">
          <span>Supplier</span>
          <span>Branch</span>
          <span>Date</span>
          <span>Total</span>
          <span>Paid</span>
          <span>Balance</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {invoices.map((invoice) => (
          <div key={invoice._id} className="invoice-row">
            <span>{invoice.supplier?.name || "-"}</span>
            <span>{invoice.branch?.name || "-"}</span>
            <span>{invoice.dateSupplied ? new Date(invoice.dateSupplied).toLocaleDateString() : "-"}</span>
            <span>₦{Number(invoice.total || 0).toLocaleString()}</span>
            <span>₦{Number(invoice.amountPaid || 0).toLocaleString()}</span>
            <span>₦{Number(invoice.balance || 0).toLocaleString()}</span>
            <span className={`status ${invoice.status}`}>{invoice.status}</span>
            <span className="row-actions">
              <button type="button" className="ghost-button" onClick={() => handleOpenPayment(invoice)}>
                Add Payment
              </button>
              {invoice.attachments?.length ? (
                <a href={invoice.attachments[0].url} target="_blank" rel="noreferrer">
                  View
                </a>
              ) : (
                <span className="muted">No file</span>
              )}
            </span>
          </div>
        ))}
        {invoices.length === 0 && <p className="muted">No invoices yet.</p>}
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Supplier Invoice</h3>
              <button className="modal-close" onClick={() => setIsCreateOpen(false)} type="button">
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateInvoice}>
              <div className="form-grid">
                <label className="full-width">
                  Supplier
                  <select
                    name="supplierId"
                    value={invoiceForm.supplierId}
                    onChange={handleInvoiceChange}
                    required
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>
                {canSelectBranch ? (
                  <label>
                    Branch
                    <select
                      name="branchId"
                      value={invoiceForm.branchId}
                      onChange={handleInvoiceChange}
                      required
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    Branch
                    <input type="text" value={currentBranch?.name || "Unassigned"} disabled />
                  </label>
                )}
                <label>
                  Invoice Number
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={invoiceForm.invoiceNumber}
                    onChange={handleInvoiceChange}
                  />
                </label>
                <label>
                  Reference
                  <input
                    type="text"
                    name="reference"
                    value={invoiceForm.reference}
                    onChange={handleInvoiceChange}
                  />
                </label>
                <label>
                  Date Supplied
                  <input
                    type="date"
                    name="dateSupplied"
                    value={invoiceForm.dateSupplied}
                    onChange={handleInvoiceChange}
                    required
                  />
                </label>
                <label>
                  Due Date
                  <input
                    type="date"
                    name="dueDate"
                    value={invoiceForm.dueDate}
                    onChange={handleInvoiceChange}
                  />
                </label>
                <label>
                  Tax
                  <input
                    type="number"
                    name="tax"
                    value={invoiceForm.tax}
                    onChange={handleInvoiceChange}
                  />
                </label>
                <label>
                  Attachments (pdf/jpg/png)
                  <input
                    type="file"
                    name="attachments"
                    multiple
                    onChange={handleInvoiceChange}
                  />
                </label>
                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    rows="3"
                    value={invoiceForm.notes}
                    onChange={handleInvoiceChange}
                  />
                </label>
              </div>

              <div className="line-items">
                <div className="line-items-header">
                  <h4>Products Supplied</h4>
                  <button type="button" className="ghost-button" onClick={addItem}>
                    Add Item
                  </button>
                </div>
                {invoiceForm.items.length === 0 && <p className="muted">No items added yet.</p>}
                {invoiceForm.items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="line-item">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, "unitCost", e.target.value)}
                      placeholder="Unit Cost"
                    />
                    <button type="button" className="link-button" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="invoice-totals">
                <span>Subtotal: ₦{subtotal.toLocaleString()}</span>
                <span>Total: ₦{total.toLocaleString()}</span>
              </div>

              <div className="modal-actions">
                <button type="submit">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentOpen && (
        <div className="modal-overlay" onClick={() => setIsPaymentOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Payment</h3>
              <button className="modal-close" onClick={() => setIsPaymentOpen(false)} type="button">
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitPayment}>
              <div className="form-grid">
                <label>
                  Amount
                  <input
                    type="number"
                    name="amount"
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    required
                  />
                </label>
                <label>
                  Method
                  <select name="method" value={paymentForm.method} onChange={handlePaymentChange}>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </label>
                <label>
                  Reference
                  <input
                    type="text"
                    name="reference"
                    value={paymentForm.reference}
                    onChange={handlePaymentChange}
                  />
                </label>
                <label className="full-width">
                  Note
                  <textarea
                    name="note"
                    rows="3"
                    value={paymentForm.note}
                    onChange={handlePaymentChange}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierInvoices;
