import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Account.scss";

const Profile = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token"); // Make sure user is logged in
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/user/profile",
        axiosConfig
      );
      setProfile({ name: data.name, email: data.email });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/user/update",
        { name: profile.name, email: profile.email, password },
        axiosConfig
      );
      setProfile({ name: data.name, email: data.email });
      setPassword("");
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  if (loading) return <p className="account-muted">Loading profile...</p>;
  if (error) return <p className="account-muted">{error}</p>;

  return (
    <div className="account-section">
      <h2>Profile</h2>
      {success && <p className="account-muted">{success}</p>}
      <div className="account-card">
        <form onSubmit={handleUpdateProfile} className="account-form">
        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          required
        />
        <input
          placeholder="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
          <button type="submit" className="account-btn">Update Profile</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
