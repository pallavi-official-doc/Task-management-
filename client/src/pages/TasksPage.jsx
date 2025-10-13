import React, { useState, useEffect, useContext, useCallback } from "react";
import API from "../api/api";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AuthContext from "../context/AuthContext";
import moment from "moment";
import { Modal } from "react-bootstrap";

const TasksPage = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 📄 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // 🕒 Format & Elapsed Helpers
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getElapsed = (task) => {
    if (task.running && task.lastStartedAt) {
      const extra = Date.now() - new Date(task.lastStartedAt).getTime();
      return task.totalSeconds * 1000 + extra;
    }
    return task.totalSeconds * 1000;
  };

  // 📡 Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const endpoint = user?.role === "admin" ? "/tasks/all-tasks" : "/tasks";
      const res = await API.get(endpoint);
      setTasks(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch tasks", err);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  // 🕒 Timer Actions
  const handleStart = async (id) => {
    try {
      await API.put(`/tasks/${id}/start`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Start timer error", err);
    }
  };

  const handlePause = async (id) => {
    try {
      await API.put(`/tasks/${id}/pause`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Pause timer error", err);
    }
  };

  const handleReset = async (id) => {
    try {
      await API.put(`/tasks/${id}/reset`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Reset timer error", err);
    }
  };

  // 🕒 Real-time update every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 📝 Open Task Modal
  const handleTaskClick = async (id) => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setSelectedTask(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to fetch task details", err);
    }
  };

  // ✅ Mark as complete
  const markTaskComplete = async (id) => {
    try {
      await API.put(`/tasks/${id}`, { status: "completed" });
      fetchTasks();
      setShowModal(false);
    } catch (err) {
      console.error("❌ Failed to mark task as complete", err);
    }
  };

  // 🗑 Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      alert("Failed to delete task");
    }
  };

  // ✏ Edit task
  const handleEdit = (task) => {
    window.location.href = `/dashboard/create-task?id=${task._id}`;
  };

  // 🔍 Filter & search
    const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      filter === "all" ? true : t.status?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 🧭 Pagination calculations
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <div className="p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{user?.role === "admin" ? "All Tasks (Admin)" : "My Tasks"}</h2>
        {user?.role !== "admin" && (
          <button
            className="btn btn-primary"
            onClick={() => (window.location.href = "/dashboard/create-task")}
          >
            <i className="fas fa-plus me-1"></i> Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <select
          className="form-select"
          style={{ width: "200px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Show All</option>
          <option value="pending">Pending</option>
          <option value="doing">Doing</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="text"
          className="form-control"
          placeholder="Search tasks..."
          style={{ width: "300px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Timer</th>
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
            {currentTasks.length > 0 ? (
              currentTasks.map((task) => (
                <tr key={task._id}>
                  {/* 🕒 Timer Column */}
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      {!task.running ? (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleStart(task._id)}
                          title="Start"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handlePause(task._id)}
                          title="Pause"
                        >
                          <i className="fas fa-pause"></i>
                        </button>
                      )}

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleReset(task._id)}
                        title="Reset"
                      >
                        <i className="fas fa-stop"></i>
                      </button>

                      <span className="badge bg-primary">
                        {formatTime(getElapsed(task))}
                      </span>
                    </div>
                  </td>

                  {/* Task Title */}
                  <td>
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#0d6efd",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleTaskClick(task._id)}
                    >
                      {task.title}
                    </span>
                  </td>

                  <td>{task.project?.name || "—"}</td>
                  <td>{moment(task.startDate).format("DD MMM YYYY")}</td>
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
                          ? "bg-info"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${
                        task.priority === "high"
                          ? "danger"
                          : task.priority === "medium"
                          ? "primary"
                          : "secondary"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {user.role === "admin" && (
                      <>
                        {task.status !== "completed" && (
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={() => markTaskComplete(task._id)}
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEdit(task)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(task._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 d-flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`btn ${
                  currentPage === i + 1
                    ? "btn-info text-white"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <>
              <h5>{selectedTask.title}</h5>
              <p>{selectedTask.description || "No description provided"}</p>
              <p><strong>Status:</strong> {selectedTask.status}</p>
              <p><strong>Priority:</strong> {selectedTask.priority}</p>
              <p><strong>Assigned To:</strong> {selectedTask.assignedTo?.name || "—"}</p>
              <p><strong>Start Date:</strong> {moment(selectedTask.startDate).format("DD MMM YYYY")}</p>
              <p><strong>Due Date:</strong> {selectedTask.dueDate ? moment(selectedTask.dueDate).format("DD MMM YYYY") : "—"}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TasksPage;



