import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Products.scss";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    images: [], // File objects for upload
  });

  const [editingProduct, setEditingProduct] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = "http://localhost:5000/api/admin/products";

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/products");
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
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);

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

      setForm({ title: "", description: "", price: "", stock: "", category: "", images: [] });
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
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: [], // can add new images
    });
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-products">
      <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

      <form className="product-form" onSubmit={handleSubmit}>
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
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <input
          type="file"
          name="images"
          multiple
          onChange={handleChange}
        />
        <div className="buttons">
          <button type="submit">{editingProduct ? "Update" : "Add"} Product</button>
          {editingProduct && (
            <button type="button" onClick={() => {
              setEditingProduct(null);
              setForm({ title: "", description: "", price: "", stock: "", category: "", images: [] });
            }}>Cancel</button>
          )}
        </div>
      </form>

      <h3>Products List</h3>
      <table className="products-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Images</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>₦{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category}</td>
              <td className="images-cell">
                {p.images && p.images.map((img, i) => (
                  <img key={i} src={img} alt={p.title} />
                ))}
              </td>
              <td>
                <button className="edit" onClick={() => handleEdit(p)}>Edit</button>
                <button className="delete" onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
