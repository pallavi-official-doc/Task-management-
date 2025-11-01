import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import AuthContext from "../../context/AuthContext";

const CreateTicketModal = ({ show, onHide, refresh }) => {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    requesterType: "user",
    requester: "",
    subject: "",
    description: "",
    assignedTo: "",
    project: "",
    files: null,
  });

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  // ✅ Load all users & projects
  const fetchBaseData = async () => {
    try {
      const [userRes, projRes] = await Promise.all([
        API.get("/users"),
        API.get("/projects"),
      ]);

      setUsers(userRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.log("Error loading users/projects", err);
    }
  };

  // ✅ Load members when project changes
  const fetchProjectMembers = async (projectId) => {
    try {
      if (!projectId) {
        setMembers([]);
        return;
      }

      const res = await API.get(`/projects/${projectId}/members`);

      setMembers(res.data || []);
    } catch (err) {
      console.log("Error loading project members", err);
    }
  };

  useEffect(() => {
    if (show) fetchBaseData();
  }, [show]);

  useEffect(() => {
    if (form.project) fetchProjectMembers(form.project);
  }, [form.project]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // ✅ Auto set requester to logged-in user if not chosen
    if (!form.requester) {
      fd.append("requester", user._id);
    }

    // ✅ Append other fields
    Object.keys(form).forEach((key) => {
      if (form[key]) fd.append(key, form[key]);
    });

    try {
      await API.post("/tickets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refresh();
      onHide();
    } catch (error) {
      console.log("Ticket create error", error);
      alert(error.response?.data?.error || "Server error");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.4)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Create Ticket</h5>
            <button className="btn-close" onClick={onHide}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Requester role */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Requester</label>
                  <br />
                  <label className="me-3">
                    <input
                      type="radio"
                      name="requesterType"
                      value="admin"
                      checked={form.requesterType === "admin"}
                      onChange={handleChange}
                    />{" "}
                    Admin
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="requesterType"
                      value="user"
                      checked={form.requesterType === "user"}
                      onChange={handleChange}
                    />{" "}
                    User
                  </label>
                </div>

                {/* Requester Name */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    Requester Name *
                  </label>
                  <select
                    className="form-select"
                    name="requester"
                    value={form.requester}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Requester --</option>
                    {users
                      .filter((u) => u.role === form.requesterType)
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Project */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Project</label>
                  <select
                    className="form-select"
                    name="project"
                    value={form.project}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Project --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assign To */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Assign To *</label>
                  <select
                    className="form-select"
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Member --</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Attachment */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Upload File</label>
                  <input
                    type="file"
                    className="form-control"
                    name="files"
                    onChange={handleChange}
                  />
                </div>

                {/* Subject */}
                <div className="col-md-12">
                  <label className="form-label fw-semibold">
                    Ticket Subject *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="col-md-12">
                  <label className="form-label fw-semibold">
                    Description *
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
