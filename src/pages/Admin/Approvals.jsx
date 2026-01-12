import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Inventory.scss";

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const canAccess = ["super_admin", "admin"].includes(role);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchApprovals = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/approvals?status=pending`, axiosConfig);
      setApprovals(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccess) {
      fetchApprovals();
    }
  }, [canAccess]);

  const handleAction = async (id, action) => {
    try {
      await axios.post(`${API_BASE_URL}/api/approvals/${id}/${action}`, {}, axiosConfig);
      setApprovals((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to update approval");
    }
  };

  if (!canAccess) return <p>You do not have access to approvals.</p>;
  if (loading) return <p>Loading approvals...</p>;

  return (
    <div className="inventory-detail">
      <div className="inventory-toolbar">
        <div>
          <h2>Approvals</h2>
          <p className="muted">Approve large inventory adjustments or refunds.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="inventory-card-panel">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Branch</th>
              <th>Requested By</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr key={approval._id}>
                <td>{approval.type.replace(/_/g, " ")}</td>
                <td>{approval.branch?.name || "-"}</td>
                <td>{approval.requestedBy?.name || "-"}</td>
                <td>{approval.reason || "-"}</td>
                <td>
                  <button type="button" onClick={() => handleAction(approval._id, "approve")}>
                    Approve
                  </button>
                  <button type="button" onClick={() => handleAction(approval._id, "reject")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {approvals.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">No pending approvals.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approvals;
