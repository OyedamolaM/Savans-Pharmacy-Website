import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Branches.scss";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    region: "",
    isOnline: false,
  });
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);

  const role = localStorage.getItem("role");
  const canCreateBranch = ["super_admin", "admin"].includes(role);
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const basePath = useMemo(
    () => (location.pathname.startsWith("/staff") ? "/staff" : "/admin"),
    [location.pathname]
  );
  const hasOnlineBranch = branches.some((branch) => branch.isOnline);

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/branches", axiosConfig);
      setBranches(data || []);
      if (!data || data.length === 0) {
        setNewBranch({
          name: "Main Branch",
          address: "",
          phone: "",
          region: "",
          isOnline: false,
        });
        setIsCreateBranchOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/branches",
        newBranch,
        axiosConfig
      );
      setBranches((prev) => [...prev, data]);
      setNewBranch({ name: "", address: "", phone: "", region: "", isOnline: false });
      setSelectedBranchId(data._id);
      setIsCreateBranchOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create branch");
    }
  };

  if (loading) return <p>Loading branches...</p>;

  return (
    <div className="branches-page">
      <div className="branches-header">
        <h2>Branches</h2>
        {canCreateBranch && (
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsCreateBranchOpen(true)}
          >
            New Branch
          </button>
        )}
      </div>
      {canCreateBranch && !hasOnlineBranch && (
        <div className="branches-note">
          <p className="muted">Online orders need an Online branch.</p>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              setNewBranch({
                name: "Online",
                address: "",
                phone: "",
                region: "",
                isOnline: true,
              });
              setIsCreateBranchOpen(true);
            }}
          >
            Create Online Branch
          </button>
        </div>
      )}

      {error && <p className="branches-error">{error}</p>}

      {isCreateBranchOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateBranchOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Branch</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCreateBranchOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateBranch}>
              <input
                type="text"
                placeholder="Branch name"
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={newBranch.address}
                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                required
                inputMode="tel"
              />
              <input
                type="text"
                placeholder="Region"
                value={newBranch.region}
                onChange={(e) => setNewBranch({ ...newBranch, region: e.target.value })}
              />
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={newBranch.isOnline}
                  onChange={(e) =>
                    setNewBranch({ ...newBranch, isOnline: e.target.checked })
                  }
                />
                Online branch (unlimited stock for online orders)
              </label>
              <button type="submit">Add Branch</button>
            </form>
          </div>
        </div>
      )}

      <div className="branches-content">
        <aside className="branches-list">
          {branches.map((branch) => (
            <button
              key={branch._id}
              className="branch-list-item"
              onClick={() => navigate(`${basePath}/branches/${branch._id}`)}
            >
              <div>
                <strong>{branch.name}</strong>
                {branch.region && <span>{branch.region}</span>}
                {branch.isOnline && <span className="branch-tag">Online</span>}
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default Branches;
