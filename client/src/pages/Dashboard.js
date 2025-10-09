import React, { useState, useEffect, useContext } from "react";
import API from "../api/api"; // ✅ using centralized axios instance
import AuthContext from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch tasks when user is available
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks"); // token auto-attached
        setTasks(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // ✅ Create new task
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/tasks", { title, description });
      setTasks([...tasks, res.data]);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };

  // ✅ Update task
  const updateTask = async (id, status) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };

  // ✅ Filter logic
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  if (!user) return <div>Loading user...</div>;
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Logout</button>

      <form onSubmit={createTask}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button type="submit">Add Task</button>
      </form>

      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <ul>
        {filteredTasks.map((task) => (
          <li key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            {task.status !== "completed" && (
              <button onClick={() => updateTask(task._id, "completed")}>
                Mark as Completed
              </button>
            )}
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
