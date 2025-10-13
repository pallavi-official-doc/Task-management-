import React, { useState, useEffect } from "react";
import API from "../api/api";
import { Modal } from "react-bootstrap";
import moment from "moment";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    startDate: "",
    dueDate: "",
    status: "pending",
    priority: "medium",
  });

  // 🔹 Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // 🔹 Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users"); // Make sure you have /users route to get all team members
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  // 📝 Handle Form Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ➕ Add / ✏️ Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTaskId) {
        await API.put(`/tasks/${editTaskId}`, formData);
      } else {
        await API.post("/tasks", formData);
      }
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving task:", err);
    }
  };

  // 📝 Edit Task
  const handleEdit = (task) => {
    setEditTaskId(task._id);
    setFormData({
      title: task.title,
      description: task.description || "",
      project: task.project?._id || "",
      assignedTo: task.assignedTo?._id || "",
      startDate: task.startDate ? moment(task.startDate).format("YYYY-MM-DD") : "",
      dueDate: task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "",
      status: task.status,
      priority: task.priority || "medium",
    });
    setShowModal(true);
  };

  // 🗑️ Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTaskId(null);
    setFormData({
      title: "",
      description: "",
      project: "",
      assignedTo: "",
      startDate: "",
      dueDate: "",
      status: "pending",
      priority: "medium",
    });
  };

  // 🔍 Filter + Search
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? task.status === "completed"
        : statusFilter === "incomplete"
        ? task.status !== "completed"
        : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Tasks</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Show All</option>
            <option value="completed">Only Completed</option>
            <option value="incomplete">Hide Completed</option>
          </select>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card p-3 shadow-sm">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Project</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, i) => (
                <tr key={task._id}>
                  <td>{i + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.project?.name || "—"}</td>
                  <td>
                    {task.startDate
                      ? moment(task.startDate).format("DD MMM YYYY")
                      : "—"}
                  </td>
                  <td>
                    {task.dueDate
                      ? moment(task.dueDate).format("DD MMM YYYY")
                      : "—"}
                  </td>
                  <td>{task.assignedTo?.name || "—"}</td>
                  <td>
                    <span
                      className={`badge ${
                        task.status === "completed"
                          ? "bg-success"
                          : task.status === "doing"
                          ? "bg-info text-dark"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        task.priority === "high"
                          ? "bg-danger"
                          : task.priority === "medium"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEdit(task)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(task._id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No tasks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editTaskId ? "Edit Task" : "Add Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Project</label>
                <select
                  name="project"
                  className="form-select"
                  value={formData.project}
                  onChange={handleChange}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Assign To</label>
                <select
                  name="assignedTo"
                  className="form-select"
                  value={formData.assignedTo}
                  onChange={handleChange}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-primary me-2">
                {editTaskId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Tasks;
