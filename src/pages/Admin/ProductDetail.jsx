import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Inventory.scss";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff")
    ? "/staff/inventory/products"
    : "/admin/inventory/products";

  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [changeReason, setChangeReason] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    costPrice: "",
    sellingPrice: "",
    expiryDate: "",
    quantityAvailable: "",
    sku: "",
    batchNumber: "",
    barcode: "",
    supplier: "",
    reorderLevel: "",
    category: "",
    taxCategory: "standard",
    taxRate: "",
    dosageForm: "",
    strength: "",
    packSize: "",
    manufacturer: "",
    images: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const canEdit = ["super_admin", "admin", "inventory_manager"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProduct = async () => {
    try {
    const { data } = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
      setProduct(data);
      setForm({
        title: data.title || "",
        description: data.description || "",
        costPrice: data.costPrice ?? "",
        sellingPrice: data.sellingPrice ?? data.price ?? "",
        expiryDate: data.expiryDate ? data.expiryDate.split("T")[0] : "",
        quantityAvailable: data.quantityAvailable ?? data.stock ?? "",
        sku: data.sku ?? "",
        batchNumber: data.batchNumber ?? "",
        barcode: data.barcode ?? "",
        supplier: data.supplier ?? "",
        reorderLevel: data.reorderLevel ?? "",
      category: data.category ?? "",
      taxCategory: data.taxCategory ?? "standard",
      taxRate: data.taxRate ?? "",
      dosageForm: data.dosageForm ?? "",
        strength: data.strength ?? "",
        packSize: data.packSize ?? "",
        manufacturer: data.manufacturer ?? "",
        images: [],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxRates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/tax-rates`, axiosConfig);
      setTaxRates(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/activity?entityType=product&entityId=${productId}`,
        axiosConfig
      );
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchHistory();
    fetchTaxRates();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm((prev) => ({ ...prev, images: files }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    const priceChanged =
      Number(form.costPrice || 0) !== Number(product.costPrice || 0) ||
      Number(form.sellingPrice || 0) !== Number(product.sellingPrice || product.price || 0);
    if (priceChanged && !changeReason) {
      setError("Reason is required for price changes.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          Array.from(value || []).forEach((file) => formData.append("images", file));
          return;
        }
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      if (priceChanged && changeReason) {
        formData.append("changeReason", changeReason);
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        formData,
        { headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" } }
      );
      setProduct(data);
      setChangeReason("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p className="error">Product not found.</p>;

  return (
    <div className="inventory-detail">
      <div className="inventory-toolbar">
        <button type="button" className="ghost-button" onClick={() => navigate(basePath)}>
          ← Back to products
        </button>
        {!canEdit && <span className="muted">View only</span>}
      </div>

      {error && <p className="error">{error}</p>}

      <form className="inventory-card-panel" onSubmit={handleSave}>
        <h3>Product Details</h3>
        <div className="inventory-form-grid">
          <label className="full-width">
            Product Name
            <input name="title" value={form.title} onChange={handleChange} disabled={!canEdit} />
          </label>
          <label className="full-width">
            Description
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Cost Price
            <input
              name="costPrice"
              type="number"
              value={form.costPrice}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Selling Price
            <input
              name="sellingPrice"
              type="number"
              value={form.sellingPrice}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Quantity
            <input
              name="quantityAvailable"
              type="number"
              value={form.quantityAvailable}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Expiry Date
            <input
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
        </div>
      </form>

      <div className="inventory-card-panel">
        <h3>Pharmaceutical Details</h3>
        <div className="inventory-form-grid">
          <label>
            Tax Category
            <select
              name="taxCategory"
              value={form.taxCategory}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="standard">Taxable</option>
              <option value="exempt">Exempt</option>
              <option value="zero">Zero Rated</option>
            </select>
          </label>
          <label>
            Tax Rate
            <select
              name="taxRate"
              value={form.taxRate}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="">Default VAT</option>
              {taxRates.map((rate) => (
                <option key={rate._id} value={rate._id}>
                  {rate.name} ({rate.rate}%)
                </option>
              ))}
            </select>
          </label>
          <label>
            Dosage Form
            <input
              name="dosageForm"
              value={form.dosageForm}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Strength
            <input
              name="strength"
              value={form.strength}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Pack Size
            <input
              name="packSize"
              value={form.packSize}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Manufacturer
            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
        </div>
      </div>

      <div className="inventory-card-panel">
        <h3>Identifiers</h3>
        <div className="inventory-form-grid">
          <label>
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} disabled={!canEdit} />
          </label>
          <label>
            Batch Number
            <input
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Barcode
            <input
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Supplier
            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Reorder Level
            <input
              name="reorderLevel"
              type="number"
              value={form.reorderLevel}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          <label className="full-width">
            Update Images
            <input
              type="file"
              name="images"
              multiple
              onChange={handleChange}
              disabled={!canEdit}
            />
          </label>
          {canEdit && (
            <label className="full-width">
              Reason for price change
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
              />
            </label>
          )}
        </div>
        {canEdit && (
          <div className="inventory-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <div className="inventory-card-panel">
        <h3>Product History</h3>
        {history.length === 0 ? (
          <p className="muted">No history yet.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Staff</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.action.replace(/_/g, " ")}</td>
                  <td>{log.user?.name || "-"}</td>
                  <td>{log.message || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
