import React, { useEffect, useState } from "react";
import axios from "axios";

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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Profile</h2>
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
