import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";

import API from "../api/api";
import moment from "moment";
import AuthContext from "../context/AuthContext";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // ✅ team users
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [progressFilter, setProgressFilter] = useState("All");
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [], // ✅ store selected user IDs here
    startDate: "",
    endDate: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // 🧠 Fetch Projects
  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // 👥 Fetch Team Users (Only users created by the logged-in user)
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users/team"); // ✅ we'll make this route
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log("Loaded team users:", users);
  }, [users]);

  // 🔍 Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    const matchesProgress =
      progressFilter === "All" ||
      (progressFilter === "0-20" && p.progress <= 20) ||
      (progressFilter === "21-50" && p.progress > 20 && p.progress <= 50) ||
      (progressFilter === "51-80" && p.progress > 50 && p.progress <= 80) ||
      (progressFilter === "81-100" && p.progress > 80);
    return matchesSearch && matchesStatus && matchesProgress;
  });

  // 📝 Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Members selection (multi-select)
  // const handleMemberSelect = (e) => {
  //   const selectedOptions = Array.from(e.target.selectedOptions).map(
  //     (option) => option.value
  //   );
  //   setFormData({ ...formData, members: selectedOptions });
  // };

  // ➕ Create / ✏ Update Project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.role !== "admin") {
      setError("Only admins can create or edit projects.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        deadline: formData.endDate || null, // ✅ renamed properly
      };

      if (editId) {
        await API.put(`/projects/${editId}`, payload);
      } else {
        await API.post("/projects", payload);
      }

      setShowModal(false);
      setFormData({
        name: "",
        description: "",
        members: [],
        startDate: "",
        endDate: "",
      });
      setEditId(null);
      fetchProjects();
    } catch (err) {
      console.error("Project save error:", err);
      setError("Failed to save project. Please try again.");
    }
  };

  // ✏️ Edit Project
  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      members: project.members?.map((m) => m._id) || [],
      startDate: moment(project.startDate).format("YYYY-MM-DD"),
      endDate: project.endDate
        ? moment(project.endDate).format("YYYY-MM-DD")
        : "",
    });
    setEditId(project._id);
    setShowModal(true);
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  return (
    <div className="container-fluid">
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          {error}
          <button className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Projects</h3>
        {user?.role === "admin" && ( // ✅ only show to admin
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ➕ New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
          >
            <option value="All">Progress: All</option>
            <option value="0-20">0% - 20%</option>
            <option value="21-50">21% - 50%</option>
            <option value="51-80">51% - 80%</option>
            <option value="81-100">81% - 100%</option>
          </select>
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Project Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Project Name</th>
              <th>Members</th>
              <th>Start Date</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <tr key={project._id}>
                  <td>{index + 1}</td>
                  <td>{project.code || "--"}</td>
                  <td>{project.name}</td>
                  <td>
                    {project.members?.map((m) => m.name).join(", ") || "—"}
                  </td>
                  <td>{moment(project.startDate).format("DD/MM/YYYY")}</td>
                  <td>
                    {project.deadline
                      ? moment(project.deadline).format("DD/MM/YYYY")
                      : "—"}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        project.status === "Active"
                          ? "bg-success"
                          : project.status === "Completed"
                          ? "bg-primary"
                          : project.status === "Overdue"
                          ? "bg-danger"
                          : project.status === "On Hold"
                          ? "bg-warning text-dark"
                          : project.status === "Cancelled"
                          ? "bg-secondary"
                          : "bg-info"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEdit(project)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(project._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No data available in table
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editId ? "Edit Project" : "New Project"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Members</label>
                    <Select
                      isMulti
                      placeholder="Select team members..."
                      options={users.map((user) => ({
                        value: user._id,
                        label: `${user.name} (${user.email})`,
                      }))}
                      value={users
                        .filter((u) => formData.members.includes(u._id))
                        .map((u) => ({
                          value: u._id,
                          label: `${u.name} (${u.email})`,
                        }))}
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          members: selected.map((s) => s.value),
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      className="form-control"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      className="form-control"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
