import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Inventory.scss";

const InventoryReports = () => {
  const [dailySales, setDailySales] = useState([]);
  const [groupBy, setGroupBy] = useState("day");
  const [taxSummary, setTaxSummary] = useState(null);
  const [returns, setReturns] = useState([]);
  const [supplierBalances, setSupplierBalances] = useState([]);
  const [movement, setMovement] = useState([]);
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const canAccess = ["super_admin", "admin", "accountant", "branch_manager"].includes(role);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [dailyRes, taxRes, returnsRes, supplierRes, movementRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/reports/sales-summary?from=${from}&to=${to}&group=${groupBy}`,
          axiosConfig
        ),
        axios.get(`http://localhost:5000/api/reports/tax-summary?from=${from}&to=${to}`, axiosConfig),
        axios.get("http://localhost:5000/api/reports/returns", axiosConfig),
        axios.get("http://localhost:5000/api/reports/supplier-balances", axiosConfig),
        axios.get(`http://localhost:5000/api/reports/inventory-movement?from=${from}&to=${to}`, axiosConfig),
      ]);
      setDailySales(dailyRes.data || []);
      setTaxSummary(taxRes.data || null);
      setReturns(returnsRes.data || []);
      setSupplierBalances(supplierRes.data || []);
      setMovement(movementRes.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      fetchReports();
    }
  }, [canAccess, from, to, groupBy]);

  if (!canAccess) return <p>You do not have access to reports.</p>;
  if (loading) return <p>Loading reports...</p>;

  return (
    <div className="inventory-detail">
      <div className="inventory-toolbar">
        <div>
          <h2>Reports</h2>
          <p className="muted">Daily sales, tax, returns, and inventory movement.</p>
        </div>
        <button type="button" className="ghost-button" onClick={fetchReports}>
          Refresh
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="inventory-card-panel">
        <h3>Sales Summary</h3>
        <div className="inventory-toolbar">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Total Orders</th>
              <th>Total Sales</th>
              <th>Tax</th>
            </tr>
          </thead>
          <tbody>
            {dailySales.map((row, idx) => (
              <tr key={`${row._id?.period}-${idx}`}>
                <td>{new Date(row._id?.period).toLocaleDateString()}</td>
                <td>{row.totalOrders}</td>
                <td>₦{Number(row.totalSales || 0).toLocaleString()}</td>
                <td>₦{Number(row.taxTotal || 0).toLocaleString()}</td>
              </tr>
            ))}
            {dailySales.length === 0 && (
              <tr>
                <td colSpan="4" className="muted">No sales data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inventory-card-panel">
        <h3>Tax Summary</h3>
        <div className="inventory-toolbar">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="stock-summary">
          <div className="stock-summary-card">
            <h4>Taxable Sales</h4>
            <p>₦{Number(taxSummary?.taxableSales || 0).toLocaleString()}</p>
          </div>
          <div className="stock-summary-card">
            <h4>VAT Collected</h4>
            <p>₦{Number(taxSummary?.taxTotal || 0).toLocaleString()}</p>
          </div>
          <div className="stock-summary-card">
            <h4>Discounts</h4>
            <p>₦{Number(taxSummary?.discountTotal || 0).toLocaleString()}</p>
          </div>
          <div className="stock-summary-card">
            <h4>Gross Sales</h4>
            <p>₦{Number(taxSummary?.grossSales || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="inventory-card-panel">
        <h3>Returns & Refunds</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.orderStatus}</td>
                <td>₦{Number(order.totalPrice || 0).toLocaleString()}</td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr>
                <td colSpan="3" className="muted">No returns yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inventory-card-panel">
        <h3>Supplier Balances</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {supplierBalances.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>₦{Number(supplier.balance || 0).toLocaleString()}</td>
              </tr>
            ))}
            {supplierBalances.length === 0 && (
              <tr>
                <td colSpan="2" className="muted">No suppliers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="inventory-card-panel">
        <h3>Inventory Movement</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {movement.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.product?.title || "-"}</td>
                <td>{item.type}</td>
                <td>{item.quantityChange}</td>
                <td>{item.reason || "-"}</td>
              </tr>
            ))}
            {movement.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">No movement records.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryReports;
