import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Users.scss";
import React from "react";
const Users = ({ defaultView = "customers", showToggle = true }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toTitleCase = (value = "") =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const formatRole = (value = "") =>
    value
      .toString()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const role = localStorage.getItem("role");
  const canManageRoles = role === "super_admin";
  const canCreateStaff = ["super_admin", "admin", "branch_manager"].includes(role);
  const canCreateCustomers = ["super_admin", "admin", "branch_manager", "cashier"].includes(role);
  const canDeleteUsers = ["super_admin", "admin", "branch_manager"].includes(role);
  const canEditCustomers = ["super_admin", "admin", "branch_manager"].includes(role);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [viewMode, setViewMode] = useState(defaultView);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
    branchId: "",
    region: "",
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = `${API_BASE_URL}/api/admin/users`;

  const fetchUsers = async () => {
    try {
      const query = viewMode === "staff" ? "?type=staff" : "?type=customers";
      const { data } = await axios.get(`${API_URL}${query}`, axiosConfig);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/branches`, axiosConfig);
      setBranches(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, axiosConfig);
      setCurrentBranch(data.branch || null);
      if (data.branch) {
        setNewUser((prev) => ({ ...prev, branchId: data.branch._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setViewMode(defaultView);
    setNewUser((prev) => ({
      ...prev,
      role: defaultView === "staff" ? "cashier" : "customer",
    }));
  }, [defaultView]);

  useEffect(() => {
    fetchUsers();
  }, [viewMode]);

  useEffect(() => {
    if (canCreateStaff && (role === "super_admin" || role === "admin")) {
      fetchBranches();
    }
    if (role === "branch_manager") {
      fetchProfile();
    }
  }, [role, canCreateStaff]);

  useEffect(() => {
    if (branches.length > 0 && !newUser.branchId && viewMode === "staff") {
      setNewUser((prev) => ({ ...prev, branchId: branches[0]._id }));
    }
  }, [branches, viewMode, newUser.branchId]);

  // Update user role
  const handleUpdateRole = async (userId, newRole) => {
    setUsers(prev =>
      prev.map(u =>
        u._id === userId
          ? { ...u, role: newRole, isAdmin: newRole === "admin" }
          : u
      )
    );

    try {
      const { data } = await axios.put(
        `${API_URL}/${userId}`,
        { role: newRole },
        axiosConfig
      );

      // Replace with backend-validated updated user
      setUsers(prev =>
        prev.map(u => (u._id === userId ? data.user : u))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update user role");
      fetchUsers(); // rollback
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_URL}/${userId}`, axiosConfig);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...newUser };
      const { data } = await axios.post(API_URL, payload, axiosConfig);

      setUsers(prev => [...prev, data.user]);
      setNewUser({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "customer",
        branchId: "",
        region: "",
      });
      setIsCreateUserOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to create user");
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "customer",
      branchId: user.branch?._id || "",
      region: user.region || "",
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        region: newUser.region,
      };
      const { data } = await axios.put(
        `${API_URL}/${editingUser._id}`,
        payload,
        axiosConfig
      );
      setUsers((prev) => prev.map((u) => (u._id === data.user._id ? data.user : u)));
      setIsEditUserOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update customer");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="users-container">
      <h2>{viewMode === "staff" ? "Staff" : "Customers"}</h2>

      {showToggle && ["super_admin", "admin", "branch_manager"].includes(role) && (
        <div className="users-toggle">
          <button
            type="button"
            className={viewMode === "customers" ? "active" : ""}
            onClick={() => {
              setViewMode("customers");
              setNewUser((prev) => ({ ...prev, role: "customer" }));
            }}
          >
            Customers
          </button>
          <button
            type="button"
            className={viewMode === "staff" ? "active" : ""}
            onClick={() => {
              setViewMode("staff");
              setNewUser((prev) => ({ ...prev, role: "cashier" }));
            }}
          >
            Staff
          </button>
        </div>
      )}

      {(viewMode === "staff" ? canCreateStaff : canCreateCustomers) ? (
        <div className="users-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsCreateUserOpen(true)}
            disabled={viewMode === "staff" && role !== "branch_manager" && branches.length === 0}
          >
            {viewMode === "staff" ? "New Staff" : "New Customer"}
          </button>
          {viewMode === "staff" && role !== "branch_manager" && branches.length === 0 && (
            <span className="muted">Create a branch before adding staff.</span>
          )}
        </div>
      ) : (
        <p className="error">You do not have permission to create users.</p>
      )}

      {isCreateUserOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateUserOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewMode === "staff" ? "Create Staff" : "Create Customer"}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCreateUserOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                required
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              />

              <input
                type="tel"
                placeholder="Phone"
                value={newUser.phone}
                required
                inputMode="tel"
                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                required
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                required
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />

              {viewMode === "staff" && canCreateStaff ? (
                <>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="cashier">Sales/Cashier</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="branch_manager">Branch Manager</option>
                    {role === "super_admin" && <option value="admin">Admin</option>}
                  </select>
                  {role === "branch_manager" ? (
                    <input
                      type="text"
                      placeholder="Branch"
                      value={currentBranch?.name || "Assigned branch"}
                      disabled
                    />
                  ) : (
                    <select
                      value={newUser.branchId}
                      onChange={e => setNewUser({ ...newUser, branchId: e.target.value })}
                      required
                    >
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    placeholder="Region"
                    value={newUser.region}
                    onChange={e => setNewUser({ ...newUser, region: e.target.value })}
                  />
                </>
              ) : (
                <input type="hidden" value="customer" />
              )}

              <button type="submit">Create</button>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            {viewMode === "staff" && <th>Role</th>}
            <th>Branch</th>
            <th>Region</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{toTitleCase(u.name)}</td>
              <td>{u.phone || "-"}</td>
              <td>{u.email}</td>

              {viewMode === "staff" && (
                <td>
                  {canManageRoles ? (
                    <select
                      value={u.role}
                      onChange={e => handleUpdateRole(u._id, e.target.value)}
                    >
                      {u.role === "staff" && (
                        <option value="staff">Staff (Legacy)</option>
                      )}
                      <option value="cashier">Sales/Cashier</option>
                      <option value="inventory_manager">Inventory Manager</option>
                      <option value="accountant">Accountant</option>
                      <option value="branch_manager">Branch Manager</option>
                      <option value="admin">Admin</option>
                      {role === "super_admin" && (
                        <option value="super_admin">Highest Admin</option>
                      )}
                    </select>
                  ) : (
                    <span className="muted">{formatRole(u.role)}</span>
                  )}
                </td>
              )}
              <td>{u.branch?.name || "-"}</td>
              <td>{u.region || "-"}</td>

              <td>
                {viewMode === "customers" && canEditCustomers && (
                  <button
                    className="update-role"
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                  >
                    Edit
                  </button>
                )}
                {canDeleteUsers ? (
                  <button
                    className="delete"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                ) : (
                  <span className="muted">No access</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {isEditUserOpen && (
        <div className="modal-overlay" onClick={() => setIsEditUserOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsEditUserOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleUpdateCustomer}>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                required
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              />

              <input
                type="tel"
                placeholder="Phone"
                value={newUser.phone}
                required
                inputMode="tel"
                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                required
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Region"
                value={newUser.region}
                onChange={e => setNewUser({ ...newUser, region: e.target.value })}
              />

              <button type="submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
