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
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import AuthContext from "../context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const updateTaskStatus = async (id, status) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
    } catch {
      setError("Failed to update status");
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete task");
    }
  };

  const handleEdit = (task) => {
    window.location.href = `/create-task?id=${task._id}`;
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  if (!user) return <div>Loading user...</div>;
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <aside
        className={`bg-dark text-white p-4 position-fixed h-100 ${
          sidebarOpen ? "d-block" : "d-none d-md-block"
        }`}
        style={{ width: "250px" }}
      >
        <h3 className="mb-4">Task Admin</h3>
        <ul className="nav flex-column gap-2">
          <li className="nav-item bg-primary rounded p-2">
            <Link to="/dashboard" className="text-white text-decoration-none">
              📋 Dashboard
            </Link>
          </li>
          {user && (
            <li className="nav-item p-2">
              <Link
                to="/create-task"
                className="text-white text-decoration-none"
              >
                ➕ Create Task
              </Link>
            </li>
          )}
          {user.role === "admin" && (
            <li className="nav-item p-2">
              <Link to="/all-tasks" className="text-white text-decoration-none">
                📂 All Tasks
              </Link>
            </li>
          )}
          <li className="nav-item p-2">
            <Link to="/profile" className="text-white text-decoration-none">
              👤 Profile
            </Link>
          </li>
          <li
            className="nav-item p-2 text-danger mt-auto"
            style={{ cursor: "pointer" }}
            onClick={logout}
          >
            🚪 Logout
          </li>
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Welcome, {user.name}</h2>
          <button
            className="btn btn-outline-dark d-md-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Filters */}
        <div className="mb-3">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn me-2 ${
                filter === f ? "btn-info text-white" : "btn-outline-secondary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <ul className="list-group">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
            >
              <div>
                <h6>{task.title}</h6>
                <p className="mb-1">{task.description}</p>
                <small>
                  User: {task.user?.name || "Unknown"} (
                  {task.user?.email || "N/A"})
                </small>
                <span
                  className={`badge ${
                    task.status === "completed"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  } ms-2`}
                >
                  {task.status.toUpperCase()}
                </span>
              </div>

              <div className="d-flex gap-2 mt-2 mt-md-0">
                {(user.role === "admin" || task.user?._id === user._id) && (
                  <>
                    {task.status !== "completed" && (
                      <button
                        onClick={() => updateTaskStatus(task._id, "completed")}
                        className="btn btn-success btn-sm"
                      >
                        ✅ Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(task)}
                      className="btn btn-primary btn-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Dashboard;
