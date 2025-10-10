import React, { useState, useContext } from "react";
import API from "../api/api";
import AuthContext from "../context/AuthContext";

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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "450px" }}>
        <h2 className="text-center mb-3 text-primary">Profile</h2>
        <p className="text-center text-secondary mb-3">
          Welcome, <strong>{user && user.name}</strong>!
        </p>

        <div className="text-center mb-4">
          <button onClick={logout} className="btn btn-danger w-50">
            Logout
          </button>
        </div>

        {message && (
          <div className="alert alert-success text-center" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
