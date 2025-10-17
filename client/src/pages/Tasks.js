// import React, { useState, useEffect, useContext, useCallback } from "react";
// import API from "../api/api";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import AuthContext from "../context/AuthContext";
// import moment from "moment";
// import { Modal } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";

// const TasksPage = () => {
//   const { user } = useContext(AuthContext);
//   const [tasks, setTasks] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState("");
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedTasks, setSelectedTasks] = useState([]); // ✅ for checkboxes
//   const navigate = useNavigate();
//   const statusOptions = [
//     { value: "pending", label: "To Do", color: "warning" },
//     { value: "doing", label: "Doing", color: "info" },
//     { value: "completed", label: "Completed", color: "success" },
//   ];

//   // 📡 Fetch tasks
//   const fetchTasks = useCallback(async () => {
//     try {
//       const endpoint = user?.role === "admin" ? "/tasks/all-tasks" : "/tasks";
//       const res = await API.get(endpoint);
//       setTasks(res.data);
//     } catch (err) {
//       console.error("❌ Failed to fetch tasks", err);
//     }
//   }, [user?.role]);

//   useEffect(() => {
//     if (user) fetchTasks();
//   }, [user, fetchTasks]);

//   // ✅ Checkbox handlers
//   const handleCheckboxChange = (taskId) => {
//     setSelectedTasks((prev) =>
//       prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
//     );
//   };

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       setSelectedTasks(tasks.map((t) => t._id));
//     } else {
//       setSelectedTasks([]);
//     }
//   };

//   // 📝 Status change
//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       await API.put(`/tasks/${id}`, { status: newStatus });
//       fetchTasks();
//     } catch (err) {
//       console.error("❌ Failed to update status", err);
//     }
//   };

//   // ▶ Start Timer
//   const handleStartTimer = async (id) => {
//     try {
//       await API.put(`/tasks/${id}/start`);
//       fetchTasks();
//     } catch (err) {
//       console.error("❌ Start timer error", err);
//     }
//   };

//   // ⏸ Pause Timer
//   const handlePauseTimer = async (id) => {
//     try {
//       await API.put(`/tasks/${id}/pause`);
//       fetchTasks();
//     } catch (err) {
//       console.error("❌ Pause timer error", err);
//     }
//   };

//   // View
//   const handleTaskClick = async (id) => {
//     try {
//       const res = await API.get(`/tasks/${id}`);
//       setSelectedTask(res.data);
//       setShowModal(true);
//     } catch (err) {
//       console.error("❌ Failed to fetch task details", err);
//     }
//   };

//   // Edit
//   const handleEdit = (task) => {
//     window.location.href = `/dashboard/create-task?id=${task._id}`;
//   };

//   // Delete
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this task?")) return;
//     try {
//       await API.delete(`/tasks/${id}`);
//       fetchTasks();
//     } catch {
//       alert("Failed to delete task");
//     }
//   };

//   // Format elapsed time (HH:mm)
//   const formatElapsed = (totalSeconds) => {
//     const h = Math.floor(totalSeconds / 3600);
//     const m = Math.floor((totalSeconds % 3600) / 60);
//     return `${h}h ${m}m`;
//   };

//   return (
//     <div className="p-3">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h2>{user?.role === "admin" ? "All Tasks" : "My Tasks"}</h2>
//         <button
//           className="btn btn-primary"
//           onClick={() => (window.location.href = "/dashboard/create-task")}
//         >
//           <i className="fas fa-plus me-1"></i> Add Task
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
//         <select
//           className="form-select"
//           style={{ width: "200px" }}
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//         >
//           <option value="all">All</option>
//           <option value="pending">To Do</option>
//           <option value="doing">Doing</option>
//           <option value="completed">Completed</option>
//         </select>
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Search tasks..."
//           style={{ width: "300px" }}
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Table */}
//       <div className="card p-3 shadow-sm">
//         <table className="table align-middle">
//           <thead>
//             <tr>
//               <th>
//                 <input
//                   type="checkbox"
//                   checked={selectedTasks.length === tasks.length && tasks.length > 0}
//                   onChange={handleSelectAll}
//                 />
//               </th>
//               <th>Code</th>
//               <th>Task</th>
//               <th>Completed On</th>
//               <th>Start Date</th>
//               <th>Due Date</th>
//               <th>Estimated Time</th>
//               <th>Hours Logged</th>
//               <th>Assigned To</th>
//               <th>Status</th>
//               <th className="text-end">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tasks.length > 0 ? (
//               tasks.map((task) => {
//                 const hoursLogged = formatElapsed(task.totalSeconds || 0);

//                 return (
//                   <tr key={task._id}>
//                     {/* ✅ Checkbox */}
//                     <td>
//                       <input
//                         type="checkbox"
//                         checked={selectedTasks.includes(task._id)}
//                         onChange={() => handleCheckboxChange(task._id)}
//                       />
//                     </td>

//                     {/* ▶ Play / ⏸ Pause in Code column */}
//                     <td>
//                       <button
//                         className={`btn btn-sm ${
//                           task.running ? "btn-warning" : "btn-outline-primary"
//                         }`}
//                         onClick={() =>
//                           task.running
//                             ? handlePauseTimer(task._id)
//                             : handleStartTimer(task._id)
//                         }
//                         title={task.running ? "Pause Timer" : "Start Timer"}
//                       >
//                         <i className={`fas ${task.running ? "fa-pause" : "fa-play"}`}></i>
//                       </button>
//                     </td>

//                     {/* Task */}
//                        <td
//                     style={{ cursor: "pointer", color: "#0d6efd", textDecoration: "underline" }}
//                     onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
//                   >
//                       {task.title}{" "}
//                       {task.priority && (
//                         <span
//                           className={`badge bg-${
//                             task.priority === "high"
//                               ? "danger"
//                               : task.priority === "medium"
//                               ? "warning text-dark"
//                               : "secondary"
//                           } ms-1`}
//                         >
//                           {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
//                         </span>
//                       )}
//                     </td>

//                     {/* Completed On */}
//                     <td>
//                       {task.status === "completed" ? "Today" : "--"}
//                     </td>

//                     {/* Start Date */}
//                     <td className="text-success">
//                       {moment(task.startDate).isValid()
//                         ? moment(task.startDate).format("DD MMM")
//                         : "--"}
//                     </td>

//                     {/* Due Date */}
//                     <td className="text-success">
//                       {task.dueDate
//                         ? moment(task.dueDate).format("DD MMM")
//                         : "--"}
//                     </td>

//                     {/* Estimated Time */}
//                     <td>0s</td>

//                     {/* Hours Logged */}
//                     <td className="text-danger">{hoursLogged}</td>

//                     {/* Assigned To */}
//                     <td>
//                       {task.assignedTo ? (
//                         <span>{task.assignedTo.name}</span>
//                       ) : (
//                         <i className="fas fa-user-circle text-secondary fs-5"></i>
//                       )}
//                     </td>

//                     {/* Status Dropdown */}
//                     <td>
//                       <div className="dropdown">
//                         <button
//                           className={`btn btn-sm dropdown-toggle ${
//                             task.status === "completed"
//                               ? "btn-success"
//                               : task.status === "doing"
//                               ? "btn-info text-white"
//                               : "btn-warning text-dark"
//                           }`}
//                           type="button"
//                           data-bs-toggle="dropdown"
//                         >
//                           {
//                             statusOptions.find((s) => s.value === task.status)?.label ||
//                             "To Do"
//                           }
//                         </button>
//                         <ul className="dropdown-menu">
//                           {statusOptions.map((option) => (
//                             <li key={option.value}>
//                               <button
//                                 className="dropdown-item d-flex align-items-center gap-2"
//                                 onClick={() => handleStatusChange(task._id, option.value)}
//                               >
//                                 <span
//                                   className={`badge bg-${option.color}`}
//                                   style={{
//                                     width: "10px",
//                                     height: "10px",
//                                     borderRadius: "50%",
//                                   }}
//                                 ></span>
//                                 {option.label}
//                               </button>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </td>

//                     {/* ⋮ Actions */}
//                     <td className="text-end">
//                       <div className="dropdown">
//                         <button
//                           className="btn btn-sm btn-outline-secondary"
//                           type="button"
//                           data-bs-toggle="dropdown"
//                         >
//                           <i className="fas fa-ellipsis-v"></i>
//                         </button>
//                         <ul className="dropdown-menu dropdown-menu-end">
//                           <li>
//                             <button
//                               className="dropdown-item d-flex align-items-center gap-2"
//                               onClick={() => handleTaskClick(task._id)}
//                             >
//                               <i className="fas fa-eye"></i> View
//                             </button>
//                           </li>
//                           <li>
//                             <button
//                               className="dropdown-item d-flex align-items-center gap-2"
//                               onClick={() => handleEdit(task)}
//                             >
//                               <i className="fas fa-edit"></i> Edit
//                             </button>
//                           </li>
//                           <li>
//                             <button
//                               className="dropdown-item text-danger d-flex align-items-center gap-2"
//                               onClick={() => handleDelete(task._id)}
//                             >
//                               <i className="fas fa-trash"></i> Delete
//                             </button>
//                           </li>
//                         </ul>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="11" className="text-center text-muted">
//                   No tasks found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* View Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Task Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedTask ? (
//             <>
//               <h5>{selectedTask.title}</h5>
//               <p>{selectedTask.description || "No description provided"}</p>
//               <p>
//                 <strong>Status:</strong> {selectedTask.status}
//               </p>
//               <p>
//                 <strong>Priority:</strong> {selectedTask.priority}
//               </p>
//             </>
//           ) : (
//             <p>Loading...</p>
//           )}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default TasksPage;
import React, { useState, useEffect, useContext, useCallback } from "react";
import API from "../api/api";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AuthContext from "../context/AuthContext";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const TasksPage = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const navigate = useNavigate();

  const statusOptions = [
    { value: "pending", label: "To Do", color: "warning" },
    { value: "doing", label: "Doing", color: "info" },
    { value: "completed", label: "Completed", color: "success" },
  ];

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

  // ⏱ Live update task timers every 1 second
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

  // ✅ Start / Pause / Stop handlers
  // ✅ Start timer + Timesheet entry
  // ✅ Start Timer → also starts Timesheet timer
  const handleStart = async (taskId) => {
    try {
      await API.post(`/timesheets/start/${taskId}`);
      fetchTasks(); // refresh table after starting
    } catch (err) {
      console.error("❌ Failed to start timer", err);
    }
  };

  // ⏸ Pause Timer → pauses both Task & Timesheet
  const handlePause = async (taskId) => {
    try {
      await API.put(`/timesheets/pause-by-task/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Failed to pause timer", err);
    }
  };

  // ⏹ Stop Timer → finalizes Timesheet and updates Task totalSeconds
  const handleStop = async (taskId) => {
    try {
      await API.put(`/timesheets/stop-by-task/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("❌ Failed to stop timer", err);
    }
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
      await API.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("❌ Failed to update status", err);
    }
  };

  // 👁 View Task
  const handleTaskClick = async (id) => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setSelectedTask(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Failed to fetch task details", err);
    }
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

  // 🕒 Format elapsed time
  const formatElapsed = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ✅ Filter + Search
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" ? true : task.status === filter;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{user?.role === "admin" ? "All Tasks" : "My Tasks"}</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard/create-task")}
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
                      onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
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

                    {/* ✅ Assigned To */}
                    <td>
                      {task.assignedTo ? (
                        <div className="d-flex align-items-center gap-1">
                          <i className="fas fa-user-circle text-secondary fs-5"></i>
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <i className="fas fa-user-circle text-secondary fs-5"></i>
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
                              onClick={() => handleTaskClick(task._id)}
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={() => handleEdit(task)}
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item text-danger d-flex align-items-center gap-2"
                              onClick={() => handleDelete(task._id)}
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
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
