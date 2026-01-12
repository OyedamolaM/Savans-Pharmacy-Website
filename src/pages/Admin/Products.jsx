import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Products.scss";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taxRates, setTaxRates] = useState([]);

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
    dosageForm: "",
    strength: "",
    packSize: "",
    manufacturer: "",
    taxCategory: "standard",
    taxRate: "",
    changeReason: "",
    images: [], // File objects for upload
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const role = localStorage.getItem("role");
  const canEditInventory = ["super_admin", "admin", "inventory_manager"].includes(role);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff")
    ? "/staff/inventory"
    : "/admin/inventory";

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = `${API_BASE_URL}/api/admin/products`;

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchTaxRates = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/tax-rates`, axiosConfig);
        setTaxRates(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTaxRates();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm({ ...form, images: files });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Create or Update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        const priceChanged =
          Number(form.costPrice || 0) !== Number(editingProduct.costPrice || 0) ||
          Number(form.sellingPrice || 0) !== Number(editingProduct.sellingPrice || editingProduct.price || 0);
        if (priceChanged && !form.changeReason) {
          setError("Reason is required for price changes.");
          return;
        }
      }
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("costPrice", form.costPrice);
      formData.append("sellingPrice", form.sellingPrice);
      formData.append("expiryDate", form.expiryDate);
      formData.append("quantityAvailable", form.quantityAvailable);
      formData.append("sku", form.sku);
      formData.append("batchNumber", form.batchNumber);
      formData.append("barcode", form.barcode);
      formData.append("supplier", form.supplier);
      formData.append("reorderLevel", form.reorderLevel);
      formData.append("category", form.category);
      formData.append("taxCategory", form.taxCategory);
      if (form.taxRate) {
        formData.append("taxRate", form.taxRate);
      }
      if (editingProduct && form.changeReason) {
        formData.append("changeReason", form.changeReason);
      }
      formData.append("dosageForm", form.dosageForm);
      formData.append("strength", form.strength);
      formData.append("packSize", form.packSize);
      formData.append("manufacturer", form.manufacturer);

      for (let i = 0; i < form.images.length; i++) {
        formData.append("images", form.images[i]);
      }

      let res;
      if (editingProduct) {
        // UPDATE
        res = await axios.put(
          `${API_URL}/${editingProduct._id}`,
          formData,
          { headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" } }
        );

        setProducts((prev) =>
          prev.map((p) => (p._id === res.data._id ? res.data : p))
        );
        setEditingProduct(null);
      } else {
        // CREATE
        res = await axios.post(API_URL, formData, {
          headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" },
        });
        setProducts((prev) => [...prev, res.data]);
      }

      setForm({
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
        dosageForm: "",
        strength: "",
        packSize: "",
        manufacturer: "",
        taxCategory: "standard",
        taxRate: "",
        changeReason: "",
        images: []
      });
      setIsProductModalOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save product");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, axiosConfig);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  // Edit product (pre-fill form)
  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title,
      description: product.description,
      costPrice: product.costPrice ?? "",
      sellingPrice: product.sellingPrice ?? product.price ?? "",
      expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
      quantityAvailable: product.quantityAvailable ?? product.stock ?? "",
      sku: product.sku ?? "",
      batchNumber: product.batchNumber ?? "",
      barcode: product.barcode ?? "",
      supplier: product.supplier ?? "",
      reorderLevel: product.reorderLevel ?? "",
      category: product.category,
      dosageForm: product.dosageForm ?? "",
      strength: product.strength ?? "",
      packSize: product.packSize ?? "",
      manufacturer: product.manufacturer ?? "",
      taxCategory: product.taxCategory ?? "standard",
      taxRate: product.taxRate ?? "",
      changeReason: "",
      images: [], // can add new images
    });
    setIsProductModalOpen(true);
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-products">
      <div className="products-header">
        <h2>Products</h2>
        {canEditInventory && (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setEditingProduct(null);
              setForm({
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
                dosageForm: "",
                strength: "",
                packSize: "",
                manufacturer: "",
                taxCategory: "standard",
                taxRate: "",
                changeReason: "",
                images: []
              });
              setIsProductModalOpen(true);
            }}
          >
            New Product
          </button>
        )}
      </div>

      {!canEditInventory && (
        <p className="inventory-note">
          You do not have permission to edit inventory.
        </p>
      )}

      <h3>Products List</h3>
      <table className="products-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Cost</th>
            <th>Selling</th>
            <th>Qty</th>
            <th>Expiry</th>
            <th>SKU</th>
            <th>Batch</th>
            <th>Barcode</th>
            <th>Supplier</th>
            <th>Reorder</th>
            <th>Category</th>
            <th>Form</th>
            <th>Strength</th>
            <th>Pack Size</th>
            <th>Manufacturer</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate(`${basePath}/products/${p._id}`)}
                >
                  {p.title}
                </button>
              </td>
              <td>₦{p.costPrice ?? "-"}</td>
              <td>₦{p.sellingPrice ?? p.price}</td>
              <td>{p.quantityAvailable ?? p.stock}</td>
              <td>{p.expiryDate ? p.expiryDate.split("T")[0] : "-"}</td>
              <td>{p.sku || "-"}</td>
              <td>{p.batchNumber || "-"}</td>
              <td>{p.barcode || "-"}</td>
              <td>{p.supplier || "-"}</td>
              <td>{p.reorderLevel ?? "-"}</td>
              <td>{p.category}</td>
              <td>{p.dosageForm || "-"}</td>
              <td>{p.strength || "-"}</td>
              <td>{p.packSize || "-"}</td>
              <td>{p.manufacturer || "-"}</td>
              <td className="images-cell">
                {p.images && p.images.map((img, i) => (
                  <img key={i} src={img} alt={p.title} />
                ))}
              </td>
              <td>
                {canEditInventory ? (
                  <>
                    <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(p._id)}>Delete</button>
                  </>
                ) : (
                  <span className="muted">View only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsProductModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body product-form" onSubmit={handleSubmit}>
              <input
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
              />
              <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />
              <input
                name="costPrice"
                type="number"
                placeholder="Cost Price"
                value={form.costPrice}
                onChange={handleChange}
              />
              <input
                name="sellingPrice"
                type="number"
                placeholder="Selling Price"
                value={form.sellingPrice}
                onChange={handleChange}
                required
              />
              <input
                name="quantityAvailable"
                type="number"
                placeholder="Quantity Available"
                value={form.quantityAvailable}
                onChange={handleChange}
                required
              />
              <input
                name="expiryDate"
                type="date"
                placeholder="Expiry Date"
                value={form.expiryDate}
                onChange={handleChange}
              />
              <input
                name="sku"
                placeholder="SKU"
                value={form.sku}
                onChange={handleChange}
              />
              <input
                name="batchNumber"
                placeholder="Batch Number"
                value={form.batchNumber}
                onChange={handleChange}
              />
              <input
                name="barcode"
                placeholder="Barcode"
                value={form.barcode}
                onChange={handleChange}
              />
              <input
                name="supplier"
                placeholder="Supplier"
                value={form.supplier}
                onChange={handleChange}
              />
              <input
                name="reorderLevel"
                type="number"
                placeholder="Reorder Level"
                value={form.reorderLevel}
                onChange={handleChange}
              />
              <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
              />
              <select
                name="taxCategory"
                value={form.taxCategory}
                onChange={handleChange}
              >
                <option value="standard">Taxable</option>
                <option value="exempt">Exempt</option>
                <option value="zero">Zero Rated</option>
              </select>
              <select
                name="taxRate"
                value={form.taxRate}
                onChange={handleChange}
              >
                <option value="">Default VAT</option>
                {taxRates.map((rate) => (
                  <option key={rate._id} value={rate._id}>
                    {rate.name} ({rate.rate}%)
                  </option>
                ))}
              </select>
              <input
                name="dosageForm"
                placeholder="Dosage Form"
                value={form.dosageForm}
                onChange={handleChange}
              />
              <input
                name="strength"
                placeholder="Strength"
                value={form.strength}
                onChange={handleChange}
              />
              <input
                name="packSize"
                placeholder="Pack Size"
                value={form.packSize}
                onChange={handleChange}
              />
              <input
                name="manufacturer"
                placeholder="Manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
              />
              {editingProduct && (
                <input
                  name="changeReason"
                  placeholder="Reason for price change"
                  value={form.changeReason}
                  onChange={handleChange}
                />
              )}
              <input
                type="file"
                name="images"
                multiple
                onChange={handleChange}
              />
              <div className="buttons">
                <button type="submit">{editingProduct ? "Update" : "Add"} Product</button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductModalOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
