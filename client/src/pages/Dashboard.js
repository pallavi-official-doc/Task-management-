// import React, { useState, useEffect, useContext } from "react";
// import API from "../api/api"; // ✅ using centralized axios instance
// import AuthContext from "../context/AuthContext";

// const Dashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const [tasks, setTasks] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // ✅ Fetch tasks when user is available
//   useEffect(() => {
//     if (!user) return;

//     const fetchTasks = async () => {
//       try {
//         const res = await API.get("/tasks"); // token auto-attached
//         setTasks(res.data);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load tasks");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [user]);

//   // ✅ Create new task
//   const createTask = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await API.post("/tasks", { title, description });
//       setTasks([...tasks, res.data]);
//       setTitle("");
//       setDescription("");
//     } catch (err) {
//       console.error(err);
//       setError("Failed to create task");
//     }
//   };

//   // ✅ Update task
//   const updateTask = async (id, status) => {
//     try {
//       const res = await API.put(`/tasks/${id}`, { status });
//       setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update task");
//     }
//   };

//   // ✅ Delete task
//   const deleteTask = async (id) => {
//     try {
//       await API.delete(`/tasks/${id}`);
//       setTasks(tasks.filter((task) => task._id !== id));
//     } catch (err) {
//       console.error(err);
//       setError("Failed to delete task");
//     }
//   };

//   // ✅ Filter logic
//   const filteredTasks = tasks.filter((task) => {
//     if (filter === "all") return true;
//     return task.status === filter;
//   });

//   if (!user) return <div>Loading user...</div>;
//   if (loading) return <div>Loading tasks...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Welcome, {user.name}!</p>
//       <button onClick={logout}>Logout</button>

//       <form onSubmit={createTask}>
//         <input
//           type="text"
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           required
//         />
//         <textarea
//           placeholder="Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         ></textarea>
//         <button type="submit">Add Task</button>
//       </form>

//       <div>
//         <button onClick={() => setFilter("all")}>All</button>
//         <button onClick={() => setFilter("pending")}>Pending</button>
//         <button onClick={() => setFilter("completed")}>Completed</button>
//       </div>

//       <ul>
//         {filteredTasks.map((task) => (
//           <li key={task._id}>
//             <h3>{task.title}</h3>
//             <p>{task.description}</p>
//             <p>Status: {task.status}</p>
//             {task.status !== "completed" && (
//               <button onClick={() => updateTask(task._id, "completed")}>
//                 Mark as Completed
//               </button>
//             )}
//             <button onClick={() => deleteTask(task._id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useState, useEffect, useContext } from "react";
// import { Link } from "react-router-dom";
// import API from "../api/api";
// import AuthContext from "../context/AuthContext";
// import { FiMenu, FiX } from "react-icons/fi";

// const Dashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const [tasks, setTasks] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [tasksOpen, setTasksOpen] = useState(false); // for collapsible Tasks section

//   useEffect(() => {
//     if (!user) return;
//     const fetchTasks = async () => {
//       try {
//         const res = await API.get("/tasks");
//         setTasks(res.data);
//       } catch (err) {
//         setError("Failed to load tasks");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchTasks();
//   }, [user]);

//   const updateTaskStatus = async (id, status) => {
//     try {
//       const res = await API.put(`/tasks/${id}`, { status });
//       setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
//     } catch {
//       setError("Failed to update status");
//     }
//   };

//   const deleteTask = async (id) => {
//     try {
//       await API.delete(`/tasks/${id}`);
//       setTasks(tasks.filter((t) => t._id !== id));
//     } catch {
//       setError("Failed to delete task");
//     }
//   };

//   const handleEdit = (task) => {
//     window.location.href = `/create-task?id=${task._id}`;
//   };

//   const filteredTasks = tasks.filter((task) =>
//     filter === "all" ? true : task.status === filter
//   );

//   if (!user) return <div>Loading user...</div>;
//   if (loading) return <div>Loading tasks...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   return (
//     <div className="d-flex min-vh-100 bg-light">
//       {/* Sidebar */}
//       <aside
//         className={`bg-dark text-white p-4 position-fixed h-100 ${
//           sidebarOpen ? "d-block" : "d-none d-md-block"
//         }`}
//         style={{ width: "250px" }}
//       >
//         <h3 className="mb-4">Task Admin</h3>
//         <ul className="nav flex-column gap-2">
//           <li className="nav-item bg-primary rounded p-2">
//             <Link to="/dashboard" className="text-white text-decoration-none">
//               📋 Dashboard
//             </Link>
//           </li>

//           {/* Work Section */}
//           <li className="nav-item mt-3">
//             <span className="fw-bold">Work 📂</span>

//             {/* Projects */}
//             <Link
//               to="/all-tasks"
//               className="d-block text-white text-decoration-none ms-3 mt-2"
//             >
//               📁 Projects
//             </Link>

//             {/* Tasks (collapsible) */}
//             <div
//               className="d-flex justify-content-between align-items-center text-white mt-2 ms-3"
//               style={{ cursor: "pointer" }}
//               onClick={() => setTasksOpen(!tasksOpen)}
//             >
//               Tasks
//               <span>{tasksOpen ? "▲" : "▼"}</span>
//             </div>
//             {tasksOpen && (
//               <div className="ms-4 mt-1">
//                 <Link
//                   to="/create-task"
//                   className="d-block text-white text-decoration-none mb-1"
//                 >
//                   ➕ Create Task
//                 </Link>
//                 <Link
//                   to="/all-tasks"
//                   className="d-block text-white text-decoration-none"
//                 >
//                   📋 View Tasks
//                 </Link>
//               </div>
//             )}

//             {/* Timesheets */}
//             <Link
//               to="/timesheets"
//               className="d-block text-white text-decoration-none mt-2 ms-3"
//             >
//               ⏱️ Timesheets
//             </Link>
//           </li>

//           {/* Profile & Logout */}
//           <li className="nav-item p-2 mt-3">
//             <Link to="/profile" className="text-white text-decoration-none">
//               👤 Profile
//             </Link>
//           </li>
//           <li
//             className="nav-item p-2 text-danger mt-auto"
//             style={{ cursor: "pointer" }}
//             onClick={logout}
//           >
//             🚪 Logout
//           </li>
//         </ul>
//       </aside>

//       {/* Main Content */}
//       <main
//         className="flex-grow-1 p-4"
//         style={{ marginLeft: sidebarOpen ? "250px" : "0" }}
//       >
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h2>Welcome, {user.name}</h2>
//           <button
//             className="btn btn-outline-dark d-md-none"
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//           >
//             {sidebarOpen ? <FiX /> : <FiMenu />}
//           </button>
//         </div>

//         {/* Filters */}
//         <div className="mb-3">
//           {["all", "pending", "completed"].map((f) => (
//             <button
//               key={f}
//               onClick={() => setFilter(f)}
//               className={`btn me-2 ${
//                 filter === f ? "btn-info text-white" : "btn-outline-secondary"
//               }`}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Task List */}
//         <ul className="list-group">
//           {filteredTasks.map((task) => (
//             <li
//               key={task._id}
//               className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
//             >
//               <div>
//                 <h6>{task.title}</h6>
//                 <p className="mb-1">{task.description}</p>
//                 <small>
//                   User: {task.user?.name || "Unknown"} (
//                   {task.user?.email || "N/A"})
//                 </small>
//                 <span
//                   className={`badge ${
//                     task.status === "completed"
//                       ? "bg-success"
//                       : "bg-warning text-dark"
//                   } ms-2`}
//                 >
//                   {task.status.toUpperCase()}
//                 </span>
//               </div>

//               <div className="d-flex gap-2 mt-2 mt-md-0">
//                 {(user.role === "admin" || task.user?._id === user._id) && (
//                   <>
//                     {task.status !== "completed" && (
//                       <button
//                         onClick={() => updateTaskStatus(task._id, "completed")}
//                         className="btn btn-success btn-sm"
//                       >
//                         ✅ Complete
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleEdit(task)}
//                       className="btn btn-primary btn-sm"
//                     >
//                       ✏️ Edit
//                     </button>
//                     <button
//                       onClick={() => deleteTask(task._id)}
//                       className="btn btn-danger btn-sm"
//                     >
//                       🗑️ Delete
//                     </button>
//                   </>
//                 )}
//               </div>
//             </li>
//           ))}
//         </ul>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { BsClockHistory, BsBell, BsSearch } from "react-icons/bs";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(true); // 👈 new state for HR
  const [workOpen, setWorkOpen] = useState(true);
  const location = useLocation();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar */}
      <aside
        className={`bg-white border-end shadow-sm p-3 d-flex flex-column ${
          sidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
        style={{
          width: sidebarOpen ? "240px" : "70px",
          transition: "width 0.3s",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link
            to="/dashboard"
            className="text-decoration-none fw-bold fs-5 text-dark"
          >
            {sidebarOpen ? "Task App" : "W"}
          </Link>
          <button
            className="btn btn-sm btn-light d-md-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="flex-grow-1">
          <ul className="nav flex-column gap-1">
            {/* Dashboard */}
            <li>
              <Link
                to="/dashboard"
                className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                  location.pathname === "/dashboard"
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                📊{" "}
                <span className={sidebarOpen ? "" : "d-none"}>Dashboard</span>
              </Link>
            </li>

            {/* ✅ HR Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setHrOpen(!hrOpen)}
              >
                <span>HR</span>
                <FiChevronDown
                  className={`transition ${hrOpen ? "rotate-180" : ""}`}
                />
              </div>

              {hrOpen && (
                <ul className="nav flex-column ms-2">
                  {/* 📝 Leaves */}
                  <li>
                    <Link
                      to="/dashboard/hr/leaves"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/leaves")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🌿
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Leaves
                      </span>
                    </Link>
                  </li>

                  {/* ⏰ Attendance */}
                  <li>
                    <Link
                      to="/dashboard/hr/attendance"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("attendance")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🕒
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Attendance
                      </span>
                    </Link>
                  </li>

                  {/* 📅 Holidays */}
                  <li>
                    <Link
                      to="/dashboard/hr/holiday"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/holiday")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📅
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Holiday
                      </span>
                    </Link>
                  </li>
                  {/* 🏆 Appreciation  ✅ */}
                  <li>
                    <Link
                      to="/dashboard/hr/appreciation"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/appreciation")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🏆
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Appreciation
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* WORK Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setWorkOpen(!workOpen)}
              >
                <span>WORK</span>
                <FiChevronDown
                  className={`transition ${workOpen ? "rotate-180" : ""}`}
                />
              </div>

              {workOpen && (
                <ul className="nav flex-column ms-2">
                  {/* 📁 Projects */}
                  <li>
                    <Link
                      to="/dashboard/projects"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("projects")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📁
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Projects
                      </span>
                    </Link>
                  </li>

                  {/* 📝 Tasks */}
                  <li>
                    <Link
                      to="/dashboard/tasks"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("tasks")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📝
                      <span className={sidebarOpen ? "" : "d-none"}>Tasks</span>
                    </Link>
                  </li>

                  {/* ⏱️ Timesheet */}
                  <li>
                    <Link
                      to="/dashboard/timesheets"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("timesheets")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      ⏱️
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Timesheet
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Finance */}
            <li className="mt-2">
              <Link
                to="#"
                className="nav-link d-flex align-items-center gap-2 p-2 rounded text-dark"
              >
                💰 <span className={sidebarOpen ? "" : "d-none"}>Finance</span>
              </Link>
            </li>

            {/* Tickets */}
            <li>
              <Link
                to="#"
                className="nav-link d-flex align-items-center gap-2 p-2 rounded text-dark"
              >
                🎫 <span className={sidebarOpen ? "" : "d-none"}>Tickets</span>
              </Link>
            </li>

            {/* Events */}
            <li>
              <Link
                to="#"
                className="nav-link d-flex align-items-center gap-2 p-2 rounded text-dark"
              >
                📅 <span className={sidebarOpen ? "" : "d-none"}>Events</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-top pt-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="bg-secondary text-white rounded-circle p-2">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div>
                <div className="fw-semibold">{user?.name}</div>
                <div className="small text-muted">Intern</div>
              </div>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-danger w-100"
            onClick={logout}
          >
            🚪 {sidebarOpen ? "Logout" : ""}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Header Bar */}
        <header className="bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <BsClockHistory className="text-muted" />
            <div className="small text-muted">
              Home •{" "}
              {location.pathname.split("/").slice(2).join(" • ") || "Dashboard"}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <BsBell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            </div>
            <BsSearch size={18} className="text-muted" />
          </div>
        </header>

        {/* Page Content */}
        <main
          className="p-4"
          style={{ backgroundColor: "#f5f6fa", minHeight: "100%" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
