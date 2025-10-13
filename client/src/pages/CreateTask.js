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

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [project, setProject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  // Fetch existing task if editing
  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      try {
        const res = await API.get(`/tasks/${taskId}`);
        const data = res.data;
        setTitle(data.title);
        setCategory(data.category || "");
        setProject(data.project || "");
        setStartDate(data.startDate ? data.startDate.split("T")[0] : "");
        setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
        setAssignedTo(data.assignedTo || "");
        setDescription(data.description || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load task for editing");
      }
    };

    fetchTask();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      title,
      category,
      project,
      startDate,
      dueDate,
      assignedTo,
      description,
    };

    try {
      if (taskId) {
        // Edit Task
        await API.put(`/tasks/${taskId}`, taskData);
      } else {
        // Create New Task
        await API.post("/tasks", taskData);
      }
      navigate("/dashboard/all-tasks");
    } catch (err) {
      console.error(err);
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

          <div className="col-md-6">
            <label className="form-label">Task Category</label>
            <input
              type="text"
              className="form-control"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Project</label>
            <input
              type="text"
              className="form-control"
              placeholder="Select project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Assigned To</label>
            <input
              type="text"
              className="form-control"
              placeholder="Employee Name"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>

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
                setCategory("");
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
            onClick={() => navigate("/dashboard/all-tasks")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
