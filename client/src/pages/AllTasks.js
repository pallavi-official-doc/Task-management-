import React, { useEffect, useState, useContext } from "react";
import API from "../api/api";
import AuthContext from "../context/AuthContext";

const AllTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Fetch all tasks on mount
  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        const res = await API.get("/tasks/all-tasks");
        setTasks(res.data);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchAllTasks();
  }, []);

  // ✅ Update task status
  const updateTaskStatus = async (id, status) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
    } catch {
      alert("Failed to update task status");
    }
  };

  // ✅ Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch {
      alert("Failed to delete task");
    }
  };

  // ✅ Edit task (redirect to Create/Edit Task page)
  const handleEdit = (task) => {
    window.location.href = `/create-task?id=${task._id}`;
  };

  // Filter & search
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" ? true : task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="p-4">
      <h2>All Tasks (Admin View)</h2>

      {/* Filters & Search */}
      <div className="d-flex gap-2 my-3 flex-wrap">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            className={`btn ${
              filter === f ? "btn-info text-white" : "btn-outline-secondary"
            }`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control w-auto ms-auto"
        />
      </div>

      {/* Task List */}
      <ul className="list-group mt-3">
        {currentTasks.map((task) => (
          <li
            key={task._id}
            className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
          >
            <div>
              <h6>{task.title}</h6>
              <p>{task.description}</p>
              <small>
                User: {task.user?.name || "Unknown"} (
                {task.user?.email || "N/A"})
              </small>
            </div>

            <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
              <span
                className={`badge ${
                  task.status === "completed"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {task.status.toUpperCase()}
              </span>

              {/* Admin actions */}
              {user.role === "admin" && (
                <>
                  {task.status !== "completed" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateTaskStatus(task._id, "completed")}
                    >
                      ✅ Complete
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEdit(task)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(task._id)}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

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
  );
};

export default AllTasks;
