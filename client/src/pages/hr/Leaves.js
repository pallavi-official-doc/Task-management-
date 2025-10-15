import React, { useState, useEffect, useContext, useCallback } from "react";
import API from "../../api/api";
import moment from "moment";
import { Modal } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AuthContext from "../../context/AuthContext";

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    duration: "Full Day",
    startDate: "",
    endDate: "",
    reason: "",
    file: null,
  });
  const [adminComment, setAdminComment] = useState("");

  // ✅ Fetch leaves (user or admin)
  const fetchLeaves = useCallback(
    async (filters = {}) => {
      try {
        const params = new URLSearchParams(filters).toString();
        const url = isAdmin ? `/leaves/admin?${params}` : `/leaves?${params}`;
        const res = await API.get(url);
        setLeaves(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch leaves", err);
      }
    },
    [isAdmin]
  );

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // ✅ Handle Search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchLeaves({ search: value });
  };

  // ✅ Handle Status Filter (Admin)
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    fetchLeaves({ search, status: value });
  };

  // ✅ Handle Submit (New Leave)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("type", formData.type);
      payload.append("duration", formData.duration);
      payload.append("startDate", formData.startDate);
      if (formData.duration === "Multiple") {
        payload.append("endDate", formData.endDate);
      }
      payload.append("reason", formData.reason);
      if (formData.file) payload.append("file", formData.file);

      await API.post("/leaves", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowModal(false);
      setFormData({
        type: "",
        duration: "Full Day",
        startDate: "",
        endDate: "",
        reason: "",
        file: null,
      });
      fetchLeaves();
    } catch (err) {
      console.error("❌ Failed to apply leave", err);
      alert("Failed to apply leave");
    }
  };

  // ✅ Admin: Approve or Reject Leave
  const handleAdminAction = async (leaveId, action) => {
    try {
      await API.put(`/leaves/admin/status/${leaveId}`, {
        status: action,
        adminComment,
      });
      setAdminComment("");
      fetchLeaves();
    } catch (err) {
      console.error(`❌ Failed to ${action} leave`, err);
    }
  };

  // 🧍 Cancel Leave (User)
  const handleCancel = async (id) => {
    try {
      await API.put(`/leaves/cancel/${id}`);
      fetchLeaves();
    } catch (err) {
      console.error("❌ Failed to cancel leave", err);
    }
  };

  // 🗑 Delete Leave (Admin or User)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave?")) return;
    try {
      await API.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      console.error("❌ Failed to delete leave", err);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{isAdmin ? "Manage Leaves" : "My Leaves"}</h3>
        {!isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus me-1"></i> New Leave
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {isAdmin && (
          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        )}

        <input
          type="text"
          placeholder="Search by type, status, reason..."
          className="form-control"
          style={{ maxWidth: "300px" }}
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>{isAdmin ? "Employee" : "Leave Date"}</th>
              {!isAdmin && <th>Leave Date</th>}
              <th>Duration</th>
              <th>Status</th>
              <th>Type</th>
              <th>Days</th>
              <th>Paid</th>
              {isAdmin && <th>Action</th>}
              {!isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  {isAdmin ? (
                    <td>
                      <div>{leave.user?.name}</div>
                      <small className="text-muted">{leave.user?.email}</small>
                    </td>
                  ) : (
                    <td>
                      {moment(leave.startDate).format("DD-MM-YYYY")}{" "}
                      {leave.endDate &&
                        ` - ${moment(leave.endDate).format("DD-MM-YYYY")}`}
                    </td>
                  )}

                  {!isAdmin && <td>{leave.duration || "Full Day"}</td>}
                  {isAdmin && (
                    <td>
                      {moment(leave.startDate).format("DD-MM-YYYY")}{" "}
                      {leave.endDate &&
                        ` - ${moment(leave.endDate).format("DD-MM-YYYY")}`}
                    </td>
                  )}

                  <td>{leave.duration}</td>
                  <td>
                    <span
                      className={`badge ${
                        leave.status === "Approved"
                          ? "bg-success"
                          : leave.status === "Pending"
                          ? "bg-warning text-dark"
                          : leave.status === "Rejected"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                  <td>{leave.type}</td>
                  <td>{leave.totalDays || "-"}</td>
                  <td>
                    {leave.paid ? (
                      <span className="badge bg-success">Paid</span>
                    ) : (
                      <span className="text-muted">Unpaid</span>
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      leave.status === "Pending" && (
                        <div className="d-flex gap-2">
                          <input
                            type="text"
                            placeholder="Comment"
                            className="form-control form-control-sm"
                            style={{ maxWidth: "120px" }}
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleAdminAction(leave._id, "Approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              handleAdminAction(leave._id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )
                    ) : leave.status === "Pending" ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancel(leave._id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(leave._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No leaves found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📝 New Leave Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>New Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.name || ""}
                  disabled
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Leave Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select Type --</option>
                  <option value="Sick">Sick</option>
                  <option value="Casual">Casual</option>
                  <option value="Earned">Earned</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label d-block">Select Duration</label>
                {["Full Day", "Multiple", "First Half", "Second Half"].map(
                  (d) => (
                    <div className="form-check form-check-inline" key={d}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="duration"
                        value={d}
                        checked={formData.duration === d}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                      />
                      <label className="form-check-label">{d}</label>
                    </div>
                  )
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  {formData.duration === "Multiple" ? "Start Date" : "Date"}
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              {formData.duration === "Multiple" && (
                <div className="col-md-6">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="col-12">
                <label className="form-label">Reason for absence</label>
                <textarea
                  className="form-control"
                  placeholder="e.g. Feeling not well"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label">Add File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Leaves;
