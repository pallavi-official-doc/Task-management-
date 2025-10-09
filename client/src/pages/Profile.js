import React, { useState, useContext } from "react";
import API from "../api/api"; // ✅ centralized axios instance
import AuthContext from "../context/AuthContext";
import "../styles/Profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [name, setName] = useState(user ? user.name : "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const res = await API.put("/users/profile", { name, password });
      setMessage("✅ Profile updated successfully!");
      console.log("Updated user:", res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <p>Welcome, {user && user.name}!</p>
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;
