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
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

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

  // 🧾 View Leave
  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setShowViewModal(true);
  };
  // ✏️ Edit Leave (Admin only)
  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setFormData({
      type: leave.type,
      duration: leave.duration,
      startDate: moment(leave.startDate).format("YYYY-MM-DD"),
      endDate: leave.endDate ? moment(leave.endDate).format("YYYY-MM-DD") : "",
      reason: leave.reason,
      file: null,
    });
    setShowEditModal(true);
  };
  // ✅ Update Leave (Admin)
  const handleUpdateLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        duration: formData.duration,
        startDate: formData.startDate,
        endDate: formData.duration === "Multiple" ? formData.endDate : null,
        reason: formData.reason,
      };

      await API.put(`/leaves/${selectedLeave._id}`, payload);

      await fetchLeaves();
      setShowEditModal(false);
    } catch (err) {
      console.error("❌ Failed to update leave", err);
      alert("Failed to update leave. Check console for details.");
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
      {/* 👁 View Leave Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Leave Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave ? (
            <div>
              <p>
                <strong>Employee:</strong> {selectedLeave.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedLeave.user?.email}
              </p>
              <p>
                <strong>Duration:</strong> {selectedLeave.duration} <br />
                <strong>Type:</strong> {selectedLeave.type}
              </p>
              <p>
                <strong>Dates:</strong>{" "}
                {moment(selectedLeave.startDate).format("DD-MM-YYYY")}
                {selectedLeave.endDate &&
                  ` - ${moment(selectedLeave.endDate).format("DD-MM-YYYY")}`}
              </p>
              <p>
                <strong>Reason:</strong> {selectedLeave.reason}
              </p>
              <p>
                <strong>Status:</strong> {selectedLeave.status}
              </p>
              {selectedLeave.adminComment && (
                <p>
                  <strong>Admin Comment:</strong> {selectedLeave.adminComment}
                </p>
              )}
            </div>
          ) : (
            <p>No leave selected.</p>
          )}
        </Modal.Body>
      </Modal>
      {/* ✏️ Edit Leave Modal (Admin only) */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave ? (
            <form onSubmit={handleUpdateLeave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Leave Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="Sick">Sick</option>
                    <option value="Casual">Casual</option>
                    <option value="Earned">Earned</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Duration</label>
                  <select
                    className="form-select"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                  >
                    <option>Full Day</option>
                    <option>Multiple</option>
                    <option>First Half</option>
                    <option>Second Half</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
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
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">Reason</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4 gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          ) : (
            <p>No leave selected.</p>
          )}
        </Modal.Body>
      </Modal>

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
              <th>Duration</th>
              <th>Status</th>
              <th>Type</th>
              <th>Days</th>
              <th>Paid</th>
              <th>Action</th>
              <th>Comment</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  {/* ✅ Employee or Admin view for first column */}
                  {isAdmin ? (
                    <td>
                      <div>{leave.user?.name}</div>
                      <small className="text-muted">{leave.user?.email}</small>
                    </td>
                  ) : (
                    <td>
                      {moment(leave.startDate).format("DD-MM-YYYY")}
                      {leave.endDate &&
                        ` - ${moment(leave.endDate).format("DD-MM-YYYY")}`}
                    </td>
                  )}

                  {/* ✅ Duration */}
                  <td>{leave.duration || "Full Day"}</td>

                  {/* ✅ Status + Admin Comment */}
                  <td>
                    <span
                      className={`badge ${
                        leave.status === "Approved"
                          ? "bg-success"
                          : leave.status === "Pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {leave.status}
                    </span>

                    {/* 👇 Show admin comment under status (for employees) */}
                    {/* {leave.adminComment && !isAdmin && (
                      <div className="mt-1 small text-muted">
                        <i className="fas fa-comment-dots me-1 text-secondary"></i>
                        <strong>Admin Comment:</strong> {leave.adminComment}
                      </div>
                    )} */}
                  </td>

                  {/* ✅ Type, Days, Paid */}
                  <td>{leave.type}</td>
                  <td>{leave.totalDays || "-"}</td>
                  <td>
                    {leave.paid ? (
                      <span className="badge bg-success">Paid</span>
                    ) : (
                      <span className="badge bg-secondary">Unpaid</span>
                    )}
                  </td>

                  {/* ✅ Actions */}
                  <td className="text-center">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light border dropdown-toggle"
                        type="button"
                        id={`dropdownMenu-${leave._id}`}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>

                      <ul
                        className="dropdown-menu dropdown-menu-end"
                        aria-labelledby={`dropdownMenu-${leave._id}`}
                      >
                        {/* 👁 View */}
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleViewLeave(leave)}
                          >
                            <i className="fas fa-eye text-primary me-2"></i>{" "}
                            View
                          </button>
                        </li>

                        {/* ✏️ Edit (Admin only) */}
                        {isAdmin && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => handleEditLeave(leave)}
                            >
                              <i className="fas fa-edit text-warning me-2"></i>{" "}
                              Edit
                            </button>
                          </li>
                        )}

                        {/* 🗑 Delete (Admin only) */}
                        {isAdmin && (
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(leave._id)}
                            >
                              <i className="fas fa-trash text-danger me-2"></i>{" "}
                              Delete
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>

                  {/* ✅ New Comment Column */}
                  <td>
                    {leave.adminComment ? (
                      <span className="text-muted small">
                        <i className="fas fa-comment-dots me-1 text-secondary"></i>
                        {leave.adminComment}
                      </span>
                    ) : (
                      <span className="text-muted small fst-italic">
                        No comment
                      </span>
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
// import React, { useState, useEffect, useContext, useCallback } from "react";
// import API from "../../api/api";
// import moment from "moment";
// import { Modal, Button, Form } from "react-bootstrap";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import AuthContext from "../../context/AuthContext";

// const Leaves = () => {
//   const { user } = useContext(AuthContext);
//   const isAdmin = user?.role === "admin";

//   const [leaves, setLeaves] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedLeave, setSelectedLeave] = useState(null);
//   const [adminComment, setAdminComment] = useState("");

//   const [formData, setFormData] = useState({
//     type: "",
//     duration: "Full Day",
//     startDate: "",
//     endDate: "",
//     reason: "",
//     file: null,
//   });

//   // ✅ Fetch Leaves
//   const fetchLeaves = useCallback(
//     async (filters = {}) => {
//       try {
//         const params = new URLSearchParams(filters).toString();
//         const url = isAdmin ? `/leaves/admin?${params}` : `/leaves?${params}`;
//         const res = await API.get(url);
//         setLeaves(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch leaves", err);
//       }
//     },
//     [isAdmin]
//   );

//   useEffect(() => {
//     fetchLeaves();
//   }, [fetchLeaves]);

//   // ✅ Handle Filters
//   const handleSearch = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     fetchLeaves({ search: value, status: statusFilter });
//   };

//   const handleStatusFilter = (value) => {
//     setStatusFilter(value);
//     fetchLeaves({ search, status: value });
//   };

//   // ✅ New Leave Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = new FormData();
//       payload.append("type", formData.type);
//       payload.append("duration", formData.duration);
//       payload.append("startDate", formData.startDate);
//       if (formData.duration === "Multiple")
//         payload.append("endDate", formData.endDate);
//       payload.append("reason", formData.reason);
//       if (formData.file) payload.append("file", formData.file);

//       await API.post("/leaves", payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setShowModal(false);
//       setFormData({
//         type: "",
//         duration: "Full Day",
//         startDate: "",
//         endDate: "",
//         reason: "",
//         file: null,
//       });
//       fetchLeaves();
//     } catch (err) {
//       console.error("❌ Failed to apply leave", err);
//       alert("Failed to apply leave");
//     }
//   };

//   // ✅ Admin Actions
//   const handleAdminAction = async (leaveId, action) => {
//     try {
//       await API.put(`/leaves/admin/status/${leaveId}`, {
//         status: action,
//         adminComment,
//       });
//       setAdminComment("");
//       fetchLeaves();
//     } catch (err) {
//       console.error(`❌ Failed to ${action} leave`, err);
//     }
//   };

//   // 🧾 View Leave
//   const handleViewLeave = (leave) => {
//     setSelectedLeave(leave);
//     setShowViewModal(true);
//   };

//   // ✏️ Edit Leave (Admin)
//   const handleEditLeave = (leave) => {
//     setSelectedLeave(leave);
//     setFormData({
//       type: leave.type,
//       duration: leave.duration,
//       startDate: moment(leave.startDate).format("YYYY-MM-DD"),
//       endDate: leave.endDate ? moment(leave.endDate).format("YYYY-MM-DD") : "",
//       reason: leave.reason,
//       file: null,
//     });
//     setShowEditModal(true);
//   };

//   // ✅ Update Leave
//   const handleUpdateLeave = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = new FormData();
//       payload.append("type", formData.type);
//       payload.append("duration", formData.duration);
//       payload.append("startDate", formData.startDate);
//       if (formData.duration === "Multiple")
//         payload.append("endDate", formData.endDate);
//       payload.append("reason", formData.reason);
//       if (formData.file) payload.append("file", formData.file);

//       await API.put(`/leaves/${selectedLeave._id}`, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setShowEditModal(false);
//       fetchLeaves();
//     } catch (err) {
//       console.error("❌ Failed to update leave", err);
//     }
//   };

//   // 🗑 Delete Leave
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this leave?")) return;
//     try {
//       await API.delete(`/leaves/${id}`);
//       fetchLeaves();
//     } catch (err) {
//       console.error("❌ Failed to delete leave", err);
//     }
//   };

//   return (
//     <div className="p-3">
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h3>{isAdmin ? "Manage Leaves" : "My Leaves"}</h3>
//         {!isAdmin && (
//           <Button variant="primary" onClick={() => setShowModal(true)}>
//             <i className="fas fa-plus me-1"></i> New Leave
//           </Button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="d-flex gap-2 mb-3 flex-wrap">
//         {isAdmin && (
//           <Form.Select
//             style={{ maxWidth: "200px" }}
//             value={statusFilter}
//             onChange={(e) => handleStatusFilter(e.target.value)}
//           >
//             <option value="">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="Approved">Approved</option>
//             <option value="Rejected">Rejected</option>
//             <option value="Cancelled">Cancelled</option>
//           </Form.Select>
//         )}
//         <Form.Control
//           type="text"
//           placeholder="Search by type, status, reason..."
//           style={{ maxWidth: "300px" }}
//           value={search}
//           onChange={handleSearch}
//         />
//       </div>

//       {/* Table */}
//       <div className="card p-3 shadow-sm">
//         <table className="table table-hover align-middle">
//           <thead className="table-light">
//             <tr>
//               <th>{isAdmin ? "Employee" : "Leave Date"}</th>
//               <th>Duration</th>
//               <th>Status</th>
//               <th>Type</th>
//               <th>Days</th>
//               <th>Paid</th>
//               <th>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {leaves.length > 0 ? (
//               leaves.map((leave) => (
//                 <tr key={leave._id}>
//                   {isAdmin ? (
//                     <td>
//                       <strong>{leave.user?.name}</strong>
//                       <br />
//                       <small className="text-muted">{leave.user?.email}</small>
//                     </td>
//                   ) : (
//                     <td>
//                       {moment(leave.startDate).format("DD-MM-YYYY")}
//                       {leave.endDate &&
//                         ` - ${moment(leave.endDate).format("DD-MM-YYYY")}`}
//                     </td>
//                   )}

//                   <td>{leave.duration || "Full Day"}</td>

//                   <td>
//                     <span
//                       className={`badge ${
//                         leave.status === "Approved"
//                           ? "bg-success"
//                           : leave.status === "Pending"
//                           ? "bg-warning text-dark"
//                           : "bg-danger"
//                       }`}
//                     >
//                       {leave.status}
//                     </span>
//                   </td>

//                   <td>{leave.type}</td>
//                   <td>{leave.totalDays || "-"}</td>
//                   <td>
//                     {leave.paid ? (
//                       <span className="badge bg-success">Paid</span>
//                     ) : (
//                       <span className="badge bg-secondary">Unpaid</span>
//                     )}
//                   </td>

//                   <td>
//                     {isAdmin ? (
//                       <div className="d-flex gap-2">
//                         <Button
//                           size="sm"
//                           variant="outline-primary"
//                           onClick={() => handleViewLeave(leave)}
//                         >
//                           <i className="fas fa-eye"></i>
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline-warning"
//                           onClick={() => handleEditLeave(leave)}
//                         >
//                           <i className="fas fa-edit"></i>
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline-danger"
//                           onClick={() => handleDelete(leave._id)}
//                         >
//                           <i className="fas fa-trash"></i>
//                         </Button>
//                       </div>
//                     ) : (
//                       <Button
//                         size="sm"
//                         variant="outline-primary"
//                         onClick={() => handleViewLeave(leave)}
//                       >
//                         <i className="fas fa-eye me-1"></i> View
//                       </Button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" className="text-center text-muted">
//                   No leaves found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* 📝 New Leave Modal */}
//       <Modal
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Apply for Leave</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleSubmit}>
//             <div className="row g-3">
//               <div className="col-md-4">
//                 <Form.Label>Name</Form.Label>
//                 <Form.Control type="text" value={user?.name || ""} disabled />
//               </div>
//               <div className="col-md-4">
//                 <Form.Label>Leave Type</Form.Label>
//                 <Form.Select
//                   value={formData.type}
//                   onChange={(e) =>
//                     setFormData({ ...formData, type: e.target.value })
//                   }
//                   required
//                 >
//                   <option value="">-- Select Type --</option>
//                   <option value="Sick">Sick</option>
//                   <option value="Casual">Casual</option>
//                   <option value="Earned">Earned</option>
//                 </Form.Select>
//               </div>
//               <div className="col-md-4">
//                 <Form.Label>Duration</Form.Label>
//                 <Form.Select
//                   value={formData.duration}
//                   onChange={(e) =>
//                     setFormData({ ...formData, duration: e.target.value })
//                   }
//                 >
//                   <option>Full Day</option>
//                   <option>Multiple</option>
//                   <option>First Half</option>
//                   <option>Second Half</option>
//                 </Form.Select>
//               </div>

//               <div className="col-md-6">
//                 <Form.Label>Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={formData.startDate}
//                   onChange={(e) =>
//                     setFormData({ ...formData, startDate: e.target.value })
//                   }
//                   required
//                 />
//               </div>

//               {formData.duration === "Multiple" && (
//                 <div className="col-md-6">
//                   <Form.Label>End Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={formData.endDate}
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                     required
//                   />
//                 </div>
//               )}

//               <div className="col-12">
//                 <Form.Label>Reason</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   placeholder="Enter reason..."
//                   value={formData.reason}
//                   onChange={(e) =>
//                     setFormData({ ...formData, reason: e.target.value })
//                   }
//                   required
//                 />
//               </div>

//               <div className="col-12">
//                 <Form.Label>Attach File</Form.Label>
//                 <Form.Control
//                   type="file"
//                   onChange={(e) =>
//                     setFormData({ ...formData, file: e.target.files[0] })
//                   }
//                 />
//               </div>
//             </div>

//             <div className="d-flex justify-content-end mt-4 gap-2">
//               <Button
//                 variant="outline-secondary"
//                 onClick={() => setShowModal(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="primary">
//                 Save
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>

//       {/* 👁 View Leave Modal */}
//       <Modal
//         show={showViewModal}
//         onHide={() => setShowViewModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Leave Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedLeave && (
//             <div>
//               <p>
//                 <strong>Employee:</strong>{" "}
//                 {selectedLeave.user?.name || user?.name}
//               </p>
//               <p>
//                 <strong>Type:</strong> {selectedLeave.type}
//               </p>
//               <p>
//                 <strong>Duration:</strong> {selectedLeave.duration}
//               </p>
//               <p>
//                 <strong>Date:</strong>{" "}
//                 {moment(selectedLeave.startDate).format("DD-MM-YYYY")}
//                 {selectedLeave.endDate &&
//                   ` - ${moment(selectedLeave.endDate).format("DD-MM-YYYY")}`}
//               </p>
//               <p>
//                 <strong>Reason:</strong> {selectedLeave.reason}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 <span
//                   className={`badge ${
//                     selectedLeave.status === "Approved"
//                       ? "bg-success"
//                       : selectedLeave.status === "Pending"
//                       ? "bg-warning text-dark"
//                       : "bg-danger"
//                   }`}
//                 >
//                   {selectedLeave.status}
//                 </span>
//               </p>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* ✏️ Edit Leave Modal */}
//       <Modal
//         show={showEditModal}
//         onHide={() => setShowEditModal(false)}
//         centered
//         size="lg"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Leave</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleUpdateLeave}>
//             <div className="row g-3">
//               <div className="col-md-4">
//                 <Form.Label>Leave Type</Form.Label>
//                 <Form.Select
//                   value={formData.type}
//                   onChange={(e) =>
//                     setFormData({ ...formData, type: e.target.value })
//                   }
//                   required
//                 >
//                   <option value="Sick">Sick</option>
//                   <option value="Casual">Casual</option>
//                   <option value="Earned">Earned</option>
//                 </Form.Select>
//               </div>
//               <div className="col-md-4">
//                 <Form.Label>Duration</Form.Label>
//                 <Form.Select
//                   value={formData.duration}
//                   onChange={(e) =>
//                     setFormData({ ...formData, duration: e.target.value })
//                   }
//                 >
//                   <option>Full Day</option>
//                   <option>Multiple</option>
//                   <option>First Half</option>
//                   <option>Second Half</option>
//                 </Form.Select>
//               </div>
//               <div className="col-md-4">
//                 <Form.Label>Start Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={formData.startDate}
//                   onChange={(e) =>
//                     setFormData({ ...formData, startDate: e.target.value })
//                   }
//                 />
//               </div>
//               {formData.duration === "Multiple" && (
//                 <div className="col-md-4">
//                   <Form.Label>End Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={formData.endDate}
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                   />
//                 </div>
//               )}
//               <div className="col-12">
//                 <Form.Label>Reason</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   value={formData.reason}
//                   onChange={(e) =>
//                     setFormData({ ...formData, reason: e.target.value })
//                   }
//                 />
//               </div>
//             </div>

//             <div className="d-flex justify-content-end mt-4 gap-2">
//               <Button
//                 variant="outline-secondary"
//                 onClick={() => setShowEditModal(false)}
//                 type="button"
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="primary">
//                 Update
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default Leaves;
