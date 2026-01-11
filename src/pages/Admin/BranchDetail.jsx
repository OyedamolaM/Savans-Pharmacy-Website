import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Branches.scss";

const BranchDetail = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [branchDetails, setBranchDetails] = useState(null);
  const [branchTab, setBranchTab] = useState("orders");
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editBranch, setEditBranch] = useState({
    name: "",
    address: "",
    phone: "",
    region: "",
  });
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);

  const [inventoryUpdate, setInventoryUpdate] = useState({
    productId: "",
    quantity: "",
  });
  const [inventoryReason, setInventoryReason] = useState("");

  const role = localStorage.getItem("role");
  const canEditBranch = ["super_admin", "admin", "branch_manager"].includes(role);
  const canManageInventory = ["super_admin", "admin", "inventory_manager", "branch_manager"].includes(role);
  const canDeleteBranch = ["super_admin", "admin"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const basePath = useMemo(
    () => (location.pathname.startsWith("/staff") ? "/staff" : "/admin"),
    [location.pathname]
  );

  const fetchBranchDetails = async () => {
    if (!branchId) return;
    try {
      const [branchRes, ordersRes, staffRes, customersRes, inventoryRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/branches/${branchId}`, axiosConfig),
        axios.get(`http://localhost:5000/api/branches/${branchId}/orders`, axiosConfig),
        axios.get(`http://localhost:5000/api/branches/${branchId}/staff`, axiosConfig),
        axios.get(`http://localhost:5000/api/branches/${branchId}/customers`, axiosConfig),
        axios.get(`http://localhost:5000/api/branches/${branchId}/inventory`, axiosConfig),
      ]);
      setBranchDetails(branchRes.data);
      setOrders(ordersRes.data || []);
      setStaff(staffRes.data || []);
      setCustomers(customersRes.data || []);
      setInventory(inventoryRes.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load branch details");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/products");
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBranchDetails();
    fetchProducts();
  }, [branchId]);

  useEffect(() => {
    if (branchDetails) {
      setEditBranch({
        name: branchDetails.name || "",
        address: branchDetails.address || "",
        phone: branchDetails.phone || "",
        region: branchDetails.region || "",
      });
    }
  }, [branchDetails]);

  const handleInventoryUpdate = async (e) => {
    e.preventDefault();
    if (!branchId || !inventoryUpdate.productId) return;
    try {
      const payload = {
        items: [
          {
            productId: inventoryUpdate.productId,
            quantity: Number(inventoryUpdate.quantity) || 0,
          },
        ],
        reason: inventoryReason || "manual_adjustment",
      };
      const response = await axios.put(
        `http://localhost:5000/api/branches/${branchId}/inventory`,
        payload,
        axiosConfig
      );
      if (response?.data?.approvalId) {
        setError("Adjustment submitted for approval.");
      }
      setInventoryUpdate({ productId: "", quantity: "" });
      setInventoryReason("");
      fetchBranchDetails();
    } catch (err) {
      console.error(err);
      setError("Failed to update inventory");
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    if (!branchId) return;
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/branches/${branchId}`,
        editBranch,
        axiosConfig
      );
      setBranchDetails(data);
      setIsEditBranchOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update branch");
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchId || !canDeleteBranch) return;
    if (!window.confirm("Delete this branch? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/branches/${branchId}`, axiosConfig);
      navigate(`${basePath}/branches`);
    } catch (err) {
      console.error(err);
      setError("Failed to delete branch");
    }
  };

  if (loading) return <p>Loading branch...</p>;

  return (
    <div className="branches-page">
      <div className="branches-header">
        <div>
          <button type="button" className="ghost-button" onClick={() => navigate(`${basePath}/branches`)}>
            ← Back to branches
          </button>
        </div>
        {canDeleteBranch && (
          <button type="button" className="danger-button" onClick={handleDeleteBranch}>
            Delete Branch
          </button>
        )}
      </div>

      {error && <p className="branches-error">{error}</p>}

      {branchDetails ? (
        <>
          <div className="branch-card">
            <h3>
              {branchDetails.name}
              {branchDetails.isOnline ? " (Online)" : ""}
            </h3>
            <p>{branchDetails.address}</p>
            <p>{branchDetails.phone && branchDetails.phone !== "N/A" ? branchDetails.phone : "-"}</p>
            {branchDetails.region && <p>Region: {branchDetails.region}</p>}
            {canEditBranch && (
              <button
                type="button"
                className="ghost-button"
                onClick={() => setIsEditBranchOpen(true)}
              >
                Edit Branch
              </button>
            )}
          </div>

          <div className="branch-tabs">
            <button
              className={branchTab === "orders" ? "active" : ""}
              onClick={() => setBranchTab("orders")}
            >
              Orders
            </button>
            <button
              className={branchTab === "customers" ? "active" : ""}
              onClick={() => setBranchTab("customers")}
            >
              Customers
            </button>
            <button
              className={branchTab === "staff" ? "active" : ""}
              onClick={() => setBranchTab("staff")}
            >
              Staff
            </button>
            <button
              className={branchTab === "inventory" ? "active" : ""}
              onClick={() => setBranchTab("inventory")}
            >
              Inventory
            </button>
          </div>

          {branchTab === "orders" && (
            <div className="branch-section">
              {orders.length === 0 ? (
                <p className="muted">No orders yet.</p>
              ) : (
                <ul>
                  {orders.map((order) => (
                    <li key={order._id}>
                      <span>{order._id}</span>
                      <span>{order.user?.name || "Customer"}</span>
                      <span>₦{order.totalPrice}</span>
                      <span>{order.orderStatus}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {branchTab === "customers" && (
            <div className="branch-section">
              {customers.length === 0 ? (
                <p className="muted">No customers yet.</p>
              ) : (
                <ul>
                  {customers.map((customer) => (
                    <li key={customer._id}>
                      <span>{customer.name}</span>
                      <span>{customer.email}</span>
                      <span>{customer.phone || "-"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {branchTab === "staff" && (
            <div className="branch-section">
              {staff.length === 0 ? (
                <p className="muted">No staff assigned.</p>
              ) : (
                <ul>
                  {staff.map((member) => (
                    <li key={member._id}>
                      <span>{member.name}</span>
                      <span>{member.email}</span>
                      <span>{member.role}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {branchTab === "inventory" && (
            <div className="branch-section">
              <div className="inventory-list">
                {inventory.length === 0 ? (
                  <p className="muted">No inventory yet.</p>
                ) : (
                  <ul>
                    {inventory.map((item) => (
                      <li key={item._id}>
                        <span>{item.product?.title || "Product"}</span>
                        <span>Qty: {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canManageInventory && (
                <form className="inventory-form" onSubmit={handleInventoryUpdate}>
                  <select
                    value={inventoryUpdate.productId}
                    onChange={(e) =>
                      setInventoryUpdate((prev) => ({
                        ...prev,
                        productId: e.target.value,
                      }))
                    }
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
                    placeholder="Quantity"
                    value={inventoryUpdate.quantity}
                    onChange={(e) =>
                      setInventoryUpdate((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={inventoryReason}
                    onChange={(e) => setInventoryReason(e.target.value)}
                  />
                  <button type="submit">Update Inventory</button>
                </form>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="muted">Branch not found.</p>
      )}

      {isEditBranchOpen && (
        <div className="modal-overlay" onClick={() => setIsEditBranchOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Branch</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsEditBranchOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleUpdateBranch}>
              <input
                type="text"
                placeholder="Branch name"
                value={editBranch.name}
                onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={editBranch.address}
                onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editBranch.phone}
                onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })}
                required
                inputMode="tel"
              />
              <input
                type="text"
                placeholder="Region"
                value={editBranch.region}
                onChange={(e) => setEditBranch({ ...editBranch, region: e.target.value })}
              />
              <div className="modal-actions">
                <button type="submit">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDetail;
