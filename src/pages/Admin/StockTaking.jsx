import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Inventory.scss";

const StockTaking = () => {
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [counts, setCounts] = useState({});
  const [reason, setReason] = useState("stock_taking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const role = localStorage.getItem("role");
  const canSelectBranch = ["super_admin", "admin"].includes(role);
  const canAdjust = ["super_admin", "admin", "inventory_manager", "branch_manager"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/user/profile", axiosConfig);
      setCurrentBranch(data.branch || null);
      if (data.branch?._id) {
        setSelectedBranchId(data.branch._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/branches", axiosConfig);
      setBranches(data || []);
      if (!selectedBranchId && data?.length) {
        setSelectedBranchId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async (branchId) => {
    if (!branchId) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/branches/${branchId}/inventory`,
        axiosConfig
      );
      setInventory(data || []);
      const nextCounts = {};
      (data || []).forEach((item) => {
        nextCounts[item.product?._id] = item.quantity;
      });
      setCounts(nextCounts);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canSelectBranch) {
      fetchBranches();
    } else {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchInventory(selectedBranchId);
    }
  }, [selectedBranchId]);

  const summary = useMemo(() => {
    let totalItems = 0;
    let excessCount = 0;
    let shortageCount = 0;
    let excessValue = 0;
    let shortageValue = 0;

    inventory.forEach((item) => {
      const systemQty = Number(item.quantity) || 0;
      const countedQty = Number(counts[item.product?._id]) || 0;
      const diff = countedQty - systemQty;
      const unitCost = Number(item.product?.costPrice || item.product?.price || 0);
      totalItems += systemQty;

      if (diff > 0) {
        excessCount += diff;
        excessValue += diff * unitCost;
      } else if (diff < 0) {
        shortageCount += Math.abs(diff);
        shortageValue += Math.abs(diff) * unitCost;
      }
    });

    return { totalItems, excessCount, shortageCount, excessValue, shortageValue };
  }, [inventory, counts]);

  const handleApplyAdjustments = async () => {
    if (!canAdjust || !selectedBranchId) return;
    setSaving(true);
    try {
      const items = inventory.map((item) => ({
        productId: item.product?._id,
        quantity: Number(counts[item.product?._id]) || 0,
      }));
      const response = await axios.put(
        `http://localhost:5000/api/branches/${selectedBranchId}/inventory`,
        { items, reason },
        axiosConfig
      );
      if (response?.data?.approvalId) {
        setError("Adjustment submitted for approval.");
      }
      fetchInventory(selectedBranchId);
    } catch (err) {
      console.error(err);
      setError("Failed to apply stock adjustments");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading stock taking...</p>;

  return (
    <div className="inventory-detail">
      <div className="inventory-toolbar">
        <div>
          <h2>Stock Taking</h2>
          <p className="muted">Compare shelf counts to system inventory.</p>
        </div>
        {canSelectBranch ? (
          <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="muted">{currentBranch?.name || "Branch not assigned"}</span>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stock-summary">
        <div className="stock-summary-card">
          <h4>Total Units</h4>
          <p>{summary.totalItems}</p>
        </div>
        <div className="stock-summary-card">
          <h4>Excess</h4>
          <p>
            {summary.excessCount} units (₦{summary.excessValue.toLocaleString()})
          </p>
        </div>
        <div className="stock-summary-card">
          <h4>Shortage</h4>
          <p>
            {summary.shortageCount} units (₦{summary.shortageValue.toLocaleString()})
          </p>
        </div>
      </div>

      <div className="inventory-card-panel">
        <h3>Count Sheet</h3>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>System Qty</th>
              <th>Counted Qty</th>
              <th>Difference</th>
              <th>Value Impact</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => {
              const productId = item.product?._id;
              const systemQty = Number(item.quantity) || 0;
              const countedQty = Number(counts[productId]) || 0;
              const diff = countedQty - systemQty;
              const unitCost = Number(item.product?.costPrice || item.product?.price || 0);
              return (
                <tr key={item._id}>
                  <td>{item.product?.title || "Product"}</td>
                  <td>{systemQty}</td>
                  <td>
                    <input
                      type="number"
                      value={counts[productId] ?? ""}
                      onChange={(e) =>
                        setCounts((prev) => ({ ...prev, [productId]: e.target.value }))
                      }
                    />
                  </td>
                  <td className={diff === 0 ? "muted" : diff > 0 ? "success" : "error"}>
                    {diff}
                  </td>
                  <td>₦{Math.abs(diff * unitCost).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {canAdjust && (
          <div className="inventory-actions">
            <input
              type="text"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button type="button" onClick={handleApplyAdjustments} disabled={saving}>
              {saving ? "Saving..." : "Apply Adjustments"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockTaking;
