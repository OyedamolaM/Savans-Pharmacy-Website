import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ActivityLog.scss";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const canSelectBranch = ["super_admin", "admin"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBranches = async () => {
    if (!canSelectBranch) return;
    try {
      const { data } = await axios.get("http://localhost:5000/api/branches", axiosConfig);
      setBranches(data || []);
      if (data?.length) {
        setSelectedBranch(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async (branchId) => {
    try {
      const query = branchId ? `?branchId=${branchId}` : "";
      const { data } = await axios.get(
        `http://localhost:5000/api/activity${query}`,
        axiosConfig
      );
      setLogs(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchLogs(canSelectBranch ? selectedBranch : "");
  }, [selectedBranch, canSelectBranch]);

  if (loading) return <p>Loading activity...</p>;

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h2>Activity Log</h2>
        {canSelectBranch && (
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="activity-table">
        <div className="activity-row header">
          <span>Time</span>
          <span>Staff</span>
          <span>Role</span>
          <span>Action</span>
          <span>Message</span>
          <span>Branch</span>
        </div>
        {logs.map((log) => (
          <div key={log._id} className="activity-row">
            <span>{new Date(log.createdAt).toLocaleString()}</span>
            <span>{log.user?.name || "-"}</span>
            <span>{log.user?.role?.replace(/_/g, " ") || "-"}</span>
            <span>{log.action.replace(/_/g, " ")}</span>
            <span>{log.message || "-"}</span>
            <span>{log.branch?.name || "-"}</span>
          </div>
        ))}
        {logs.length === 0 && <p className="muted">No activity yet.</p>}
      </div>
    </div>
  );
};

export default ActivityLog;
