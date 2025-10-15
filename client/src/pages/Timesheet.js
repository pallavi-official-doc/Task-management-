import React, { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import moment from "moment";
import { Modal } from "react-bootstrap";
import Select from "react-select"; // ✅ for searchable dropdown

const Timesheet = () => {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  // const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);

  // Filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInvoice, setFilterInvoice] = useState("all");

  // 📡 Fetch timesheet entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await API.get("/timesheets");
      setEntries(res.data);
      const active = res.data.find((e) => e.task?.running === true);
      setActiveTimer(active || null);
    } catch (err) {
      console.error("❌ Error fetching timesheet entries:", err);
    }
  }, []);

  // 📡 Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    }
  }, []);

  // // 📡 Fetch distinct statuses from backend
  // const fetchStatuses = useCallback(async () => {
  //   try {
  //     const res = await API.get("/tasks/statuses");
  //     // setStatuses(res.data || []);
  //   } catch (err) {
  //     console.error("❌ Error fetching statuses:", err);
  //   }
  // }, []);

  useEffect(() => {
    fetchEntries();
    fetchProjects();
    // fetchStatuses();
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, [
    fetchEntries,
    fetchProjects,
    //  fetchStatuses
  ]);

  // ⏱ Timer Display
  const getActiveTimerDisplay = () => {
    if (!activeTimer) return "00:00:00";
    const start = new Date(activeTimer.startTime);
    const now = new Date();
    const diffSec = Math.floor((now - start) / 1000);
    const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
    const s = String(diffSec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // ⏱ Format Duration
  const formatDuration = (start, end) => {
    if (!start) return "--";
    const endTime = end ? new Date(end) : new Date();
    let diffMs = endTime - new Date(start);
    if (diffMs < 0) diffMs = 0;
    const diffMins = Math.floor(diffMs / 60000);
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return h === 0 ? `${m}m` : `${h}h ${m}m`;
  };

  // 👁 View
  const handleView = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // ⏹ Stop timer
  const handleStop = async (entry) => {
    try {
      await API.put(`/tasks/${entry.task._id}/pause`);
      fetchEntries();
    } catch (err) {
      console.error("Error stopping timer:", err);
    }
  };

  // 🧠 Filter logic
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.task?.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesProject =
      filterProject === "all" || entry.task?.project?._id === filterProject;

    const matchesStatus =
      filterStatus === "all" || entry.task?.status === filterStatus;

    const matchesInvoice =
      filterInvoice === "all" ||
      (filterInvoice === "yes"
        ? entry.invoiceGenerated
        : !entry.invoiceGenerated);

    return matchesSearch && matchesProject && matchesStatus && matchesInvoice;
  });

  return (
    <div className="p-3">
      {/* 🧭 Breadcrumb + Timer */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <i className="fas fa-clock me-1"></i> Home
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Timesheet
              </li>
            </ol>
          </nav>
        </div>
        <div className="border rounded px-3 py-1 bg-light fw-bold">
          {getActiveTimerDisplay()}
        </div>
      </div>

      {/* Filter Row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span className="fw-semibold">Duration</span>
          <input
            type="date"
            className="form-control"
            style={{ width: "160px" }}
          />
          <span>to</span>
          <input
            type="date"
            className="form-control"
            style={{ width: "160px" }}
          />

          {/* Employee */}
          <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="avatar"
              width="24"
              height="24"
              className="rounded-circle"
            />
            Pallavi Pawar
            <span className="badge bg-light text-dark border ms-1">
              It's You
            </span>
          </button>

          {/* Search */}
          <div className="input-group" style={{ width: "250px" }}>
            <span className="input-group-text bg-white">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Start typing to search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters Button */}
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => setShowFilterPanel(true)}
          >
            <i className="fas fa-filter"></i>
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Toolbar Row */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-primary">
          <i className="fas fa-plus me-1"></i> Log Time
        </button>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark active">
            <i className="fas fa-list"></i>
          </button>
          <button className="btn btn-outline-dark">
            <i className="fas fa-calendar-alt"></i>
          </button>
          <button className="btn btn-outline-dark">
            <i className="fas fa-user"></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-2 shadow-sm">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedEntries.length === entries.length &&
                    entries.length > 0
                  }
                  onChange={(e) =>
                    setSelectedEntries(
                      e.target.checked ? entries.map((t) => t._id) : []
                    )
                  }
                />
              </th>
              <th>#</th>
              <th>Code</th>
              <th>Task</th>
              <th>Employee</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Total Hours</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <tr key={entry._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry._id)}
                      onChange={() =>
                        setSelectedEntries((prev) =>
                          prev.includes(entry._id)
                            ? prev.filter((id) => id !== entry._id)
                            : [...prev, entry._id]
                        )
                      }
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>{entry.task?.shortCode || "--"}</td>
                  <td
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleView(entry)}
                  >
                    {entry.task?.title || "--"}
                  </td>
                  <td>{entry.user?.name || "--"}</td>
                  <td>
                    {moment(entry.startTime).format("DD-MM-YYYY hh:mm a")}
                  </td>
                  <td>
                    {entry.task?.running ? (
                      <span className="badge bg-primary">Active</span>
                    ) : entry.endTime ? (
                      <span className="badge bg-secondary">Paused</span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td>
                    {formatDuration(entry.startTime, entry.endTime)}{" "}
                    <i className="fas fa-hourglass-half text-muted"></i>
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
                            onClick={() => handleView(entry)}
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                        </li>
                        {entry.task?.running && (
                          <li>
                            <button
                              className="dropdown-item text-danger d-flex align-items-center gap-2"
                              onClick={() => handleStop(entry)}
                            >
                              <i className="fas fa-stop"></i> Stop
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No timesheet entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Filter Panel */}
      <div
        className={`offcanvas offcanvas-end ${showFilterPanel ? "show" : ""}`}
        tabIndex="-1"
        style={{ visibility: showFilterPanel ? "visible" : "hidden" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filters</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowFilterPanel(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          {/* Project */}
          <div className="mb-3">
            <label className="form-label">Project</label>
            <select
              className="form-select"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="all">All</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Status - React Select (Fixed Options) */}
          <div className="mb-3">
            <label className="form-label">Status</label>
            <Select
              options={[
                { value: "all", label: "All" },
                { value: "approved", label: "approved" },
                { value: "pending", label: "Pending" },
                { value: "active", label: "active" },
              ]}
              value={{
                value: filterStatus,
                label:
                  filterStatus === "all"
                    ? "All"
                    : filterStatus.charAt(0).toUpperCase() +
                      filterStatus.slice(1),
              }}
              onChange={(option) => setFilterStatus(option.value)}
              isSearchable={false} // optional — you can set true if you want to search
              placeholder="Select status..."
              classNamePrefix="react-select"
            />
          </div>

          {/* Invoice Generated */}
          <div className="mb-3">
            <label className="form-label">Invoice Generated</label>
            <select
              className="form-select"
              value={filterInvoice}
              onChange={(e) => setFilterInvoice(e.target.value)}
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div className="offcanvas-footer border-top p-3 text-end">
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setFilterProject("all");
              setFilterStatus("all");
              setFilterInvoice("all");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Timesheet Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntry && (
            <>
              <p>
                <strong>Task:</strong> {selectedEntry.task?.title}
              </p>
              <p>
                <strong>Employee:</strong> {selectedEntry.user?.name}
              </p>
              <p>
                <strong>Start:</strong>{" "}
                {moment(selectedEntry.startTime).format("DD-MM-YYYY hh:mm a")}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {selectedEntry.endTime
                  ? moment(selectedEntry.endTime).format("DD-MM-YYYY hh:mm a")
                  : selectedEntry.task?.running
                  ? "Active"
                  : "--"}
              </p>
              <p>
                <strong>Total:</strong>{" "}
                {formatDuration(selectedEntry.startTime, selectedEntry.endTime)}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Timesheet;
