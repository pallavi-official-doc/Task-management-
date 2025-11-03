import React, { useState, useEffect, useContext, useCallback } from "react";
import API from "../api/api";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AuthContext from "../context/AuthContext";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TasksPage = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  // const [userProjects, setUserProjects] = useState([]);

  const navigate = useNavigate();

  // ✅ Sync with clock-in status from localStorage
  const [attendanceStatus, setAttendanceStatus] = useState(
    localStorage.getItem("attendanceStatus") || "out"
  );

  const statusOptions = [
    { value: "pending", label: "To Do", color: "warning" },
    { value: "doing", label: "Doing", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
  ];

  // 📡 Fetch tasks (only when clocked in)
  const fetchTasks = useCallback(async () => {
    const currentStatus = localStorage.getItem("attendanceStatus");
    if (currentStatus === "out" || !currentStatus) return; // 🚫 Skip if not clocked in

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
  // useEffect(() => {
  //   const fetchUserProjects = async () => {
  //     try {
  //       if (user?.role === "admin") {
  //         setUserProjects(["all"]); // Admin has access to all projects
  //         return;
  //       }

  //       const res = await API.get("/projects/assigned-to-me");
  //       setUserProjects(res.data.map((p) => p._id));
  //     } catch (err) {
  //       console.error("❌ Failed to fetch user projects", err);
  //     }
  //   };

  //   if (user) fetchUserProjects();
  // }, [user]);

  // 🔁 Listen to changes from Dashboard (Clock In / Clock Out)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedStatus = localStorage.getItem("attendanceStatus") || "out";
      setAttendanceStatus(updatedStatus);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ⏱ Live timer updater
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          let displaySeconds = t.totalSeconds || 0;
          if (t.running && t.lastStartedAt) {
            const started = new Date(t.lastStartedAt).getTime();
            const now = Date.now();
            displaySeconds += Math.floor((now - started) / 1000);
          }
          return { ...t, displaySeconds };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🕒 Format elapsed time
  const formatElapsed = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ✅ Checkbox handlers
  const handleCheckboxChange = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTasks(tasks.map((t) => t._id));
    } else {
      setSelectedTasks([]);
    }
  };

  // 📝 Status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const currentTask = tasks.find((t) => t._id === id);
      await API.put(`/tasks/${id}`, {
        status: newStatus,
        assignedTo:
          currentTask?.assignedTo?._id || currentTask?.assignedTo || null,
      });
      fetchTasks();
    } catch (err) {
      console.error("❌ Failed to update status", err);
    }
  };

  // 👁 View Task
  const handleTaskClick = (taskId) => {
    navigate(`/dashboard/tasks/${taskId}`);
  };

  // ✏ Edit
  const handleEdit = (task) => {
    navigate(`/dashboard/create-task?id=${task._id}`);
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch {
      alert("Failed to delete task");
    }
  };

  // ✅ Filter + Search
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" ? true : task.status === filter;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const canCreateTask = attendanceStatus === "in";

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{user?.role === "admin" ? "All Tasks" : "My Tasks"}</h2>

        {/* ✅ Add Task button disabled unless Clocked In */}
        <button
          className={`btn ${canCreateTask ? "btn-primary" : "btn-secondary"}`}
          onClick={() => {
            if (canCreateTask) navigate("/dashboard/create-task");
          }}
          disabled={!canCreateTask}
          title={
            !canCreateTask
              ? "Please Clock-In to create a task"
              : "Create new task"
          }
        >
          <i className="fas fa-plus me-1"></i> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
        <select
          className="form-select"
          style={{ width: "200px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">To Do</option>
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
        <table className="table align-middle">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedTasks.length === tasks.length && tasks.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Task</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Hours Logged</th>
              <th>Assigned To</th>
              <th>Assigned By</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const displayTime = formatElapsed(
                  task.displaySeconds || task.totalSeconds || 0
                );
                return (
                  <tr key={task._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task._id)}
                        onChange={() => handleCheckboxChange(task._id)}
                      />
                    </td>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "#0d6efd",
                        textDecoration: "underline",
                      }}
                      onClick={() => handleTaskClick(task._id)}
                    >
                      {task.title}
                    </td>
                    <td>
                      {task.startDate
                        ? moment(task.startDate).format("DD MMM")
                        : "--"}
                    </td>
                    <td>
                      {task.dueDate
                        ? moment(task.dueDate).format("DD MMM")
                        : "--"}
                    </td>
                    <td className="text-danger">{displayTime}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <i className="fas fa-user-circle text-secondary fs-5"></i>
                        {task.assignedTo ? (
                          <span>{task.assignedTo.name || "Unnamed User"}</span>
                        ) : (
                          <span className="text-muted fst-italic">
                            Not Assigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {task.user ? (
                        <div className="d-flex align-items-center gap-1">
                          <i className="fas fa-user-tie text-secondary fs-5"></i>
                          <span>{task.user.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="dropdown">
                        <button
                          className={`btn btn-sm dropdown-toggle ${
                            task.status === "completed"
                              ? "btn-success"
                              : task.status === "doing"
                              ? "btn-info text-white"
                              : "btn-warning text-dark"
                          }`}
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          {
                            statusOptions.find((s) => s.value === task.status)
                              ?.label
                          }
                        </button>
                        <ul className="dropdown-menu">
                          {statusOptions.map((option) => (
                            <li key={option.value}>
                              <button
                                className="dropdown-item d-flex align-items-center gap-2"
                                disabled={
                                  task.status === "completed" &&
                                  option.value !== "completed"
                                }
                                onClick={() =>
                                  handleStatusChange(task._id, option.value)
                                }
                              >
                                <span
                                  className={`badge bg-${option.color}`}
                                  style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                  }}
                                ></span>
                                {option.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowModal(true);
                              }}
                            >
                              <i className="fas fa-eye text-primary"></i> View
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={() => handleEdit(task)}
                            >
                              <i className="fas fa-edit text-warning"></i> Edit
                            </button>
                          </li>
                          {isAdmin && (
                            <li>
                              <button
                                className="dropdown-item text-danger d-flex align-items-center gap-2"
                                onClick={() => handleDelete(task._id)}
                              >
                                <i className="fas fa-trash"></i> Delete
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask ? (
            <>
              <h5>{selectedTask.title}</h5>
              <p>{selectedTask.description || "No description provided"}</p>
              <p>
                <strong>Status:</strong> {selectedTask.status}
              </p>
              <p>
                <strong>Priority:</strong> {selectedTask.priority}
              </p>
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
