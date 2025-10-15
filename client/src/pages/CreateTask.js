// import React, { useState, useContext } from "react";
// import API from "../api/api";
// import AuthContext from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const CreateTask = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await API.post("/tasks", { title, description });
//       // After creating, redirect to dashboard
//       navigate("/dashboard");
//     } catch (err) {
//       setError("Failed to create task");
//     }
//   };

//   if (!user) return <div>Loading user...</div>;

//   return (
//     <div className="p-4">
//       <h2>Create New Task</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleSubmit} className="card p-4 shadow-sm mt-3">
//         <div className="mb-3">
//           <input
//             type="text"
//             placeholder="Enter title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="form-control"
//             required
//           />
//         </div>
//         <div className="mb-3">
//           <textarea
//             placeholder="Enter description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="form-control"
//           ></textarea>
//         </div>
//         <button className="btn btn-primary" type="submit">
//           Add Task
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateTask;
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/api";
import AuthContext from "../context/AuthContext";

const CreateTask = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("id");

  // ✅ Form fields
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  // ✅ Dropdown data
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // 🧠 Fetch projects and users for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const projRes = await API.get("/projects");
        setProjects(projRes.data || []);

        const userRes = await API.get("/users"); // backend must have this
        setUsers(userRes.data || []);
      } catch (err) {
        console.error("❌ Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  // ✏️ If editing task
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const res = await API.get(`/tasks/${taskId}`);
        const data = res.data;
        setTitle(data.title);
        setProject(data.project || "");
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
        setAssignedTo(data.assignedTo || "");
        setDescription(data.description || "");
      } catch (err) {
        console.error("❌ Failed to load task for editing", err);
        setError("Failed to load task for editing");
      }
    };

    fetchTask();
  }, [taskId]);

  // 📝 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const taskData = {
      title,
      project: project || null,
      startDate,
      dueDate,
      assignedTo: assignedTo || null,
      description,
    };

    try {
      if (taskId) {
        // ✏️ Edit
        await API.put(`/tasks/${taskId}`, taskData);
      } else {
        // ➕ Create
        await API.post("/tasks", taskData);
      }
      navigate("/dashboard/tasks");
    } catch (err) {
      console.error("❌ Save task error", err);
      setError("Failed to save task");
    }
  };

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="container p-3">
      <h3>{taskId ? "Edit Task" : "Add Task"}</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm mt-3">
        <h5 className="mb-3">Task Info</h5>

        <div className="row g-3">
          {/* 📝 Title */}
          <div className="col-md-6">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter a task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 🧭 Project */}
          <div className="col-md-6">
            <label className="form-label">Project</label>
            <select
              className="form-select"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🗓 Start Date */}
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* 🗓 Due Date */}
          <div className="col-md-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* 👤 Assigned To */}
          <div className="col-md-6">
            <label className="form-label">Assigned To</label>
            <select
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Select Employee</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* 📝 Description */}
          <div className="col-md-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4 gap-2">
          <button type="submit" className="btn btn-primary">
            {taskId ? "Update Task" : "Save"}
          </button>
          {!taskId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setTitle("");
                setProject("");
                setStartDate("");
                setDueDate("");
                setAssignedTo("");
                setDescription("");
              }}
            >
              Save & Add More
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => navigate("/dashboard/tasks")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
