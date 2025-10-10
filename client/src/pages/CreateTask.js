import React, { useState, useContext } from "react";
import API from "../api/api";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", { title, description });
      // After creating, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to create task");
    }
  };

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="p-4">
      <h2>Create New Task</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mt-3">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
          ></textarea>
        </div>
        <button className="btn btn-primary" type="submit">
          Add Task
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
