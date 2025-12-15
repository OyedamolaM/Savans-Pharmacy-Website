import { useEffect, useState } from "react";
import axios from "axios";
import "./Users.scss";
import React from "react";
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = "http://localhost:5000/api/admin/users";

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(API_URL, axiosConfig);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        role: "user"
      });
    } catch (err) {
      console.error(err);
      setError("Failed to create user");
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="users-container">
      <h2>Users Management</h2>

      {/* Create User Form */}
      <form className="create-user-form" onSubmit={handleCreate}>
        <h3>Create User</h3>

        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          required
          onChange={e => setNewUser({ ...newUser, name: e.target.value })}
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

        <select
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Create</button>
      </form>

      {/* Users Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>

              <td>
                <select
                  value={u.role}
                  onChange={e => handleUpdateRole(u._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td>
                <button
                  className="delete"
                  onClick={() => handleDelete(u._id)}
                >
                  Delete
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
