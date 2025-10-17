import React, { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import moment from "moment";
import { Modal } from "react-bootstrap";
import Select from "react-select"; // ✅ for searchable dropdown
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Timesheet = () => {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);

  // 🟡 ADDED — Filters for admin
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");

  // 🟡 ADDED — Date range filter
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showDateModal, setShowDateModal] = useState(false);

  // Filters
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInvoice, setFilterInvoice] = useState("all");

  // 📡 Fetch timesheet entries
  // const fetchEntries = useCallback(async () => {
  //   try {
  //     const res = await API.get("/timesheets");
  //     setEntries(res.data);
  //     const active = res.data.find((e) => e.task?.running === true);
  //     setActiveTimer(active || null);
  //   } catch (err) {
  //     console.error("❌ Error fetching timesheet entries:", err);
  //   }
  // }, []);

  // 📡 Fetch timesheet entries with filters
  const fetchEntries = useCallback(async () => {
    try {
      let url = "/timesheets";
      const params = [];

      if (selectedUser !== "all") {
        params.push(`user=${selectedUser}`);
      }
      if (startDate && endDate) {
        params.push(
          `start=${moment(startDate).format("YYYY-MM-DD")}&end=${moment(
            endDate
          ).format("YYYY-MM-DD")}`
        );
      }

      if (params.length) {
        url += "?" + params.join("&");
      }

      const res = await API.get(url);
      setEntries(res.data);
      const active = res.data.find((e) => e.task?.running === true);
      setActiveTimer(active || null);
    } catch (err) {
      console.error("❌ Error fetching timesheet entries:", err);
    }
  }, [selectedUser, startDate, endDate]);

  // 📡 Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    }
  }, []);
  // 🟡 ADDED — Fetch users (admin filter)
  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchProjects();
    fetchUsers();

    // 🕒 Background sync every 30s
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, [fetchEntries, fetchProjects]);

  // ⏱ Live update display durations every second
  useEffect(() => {
    const interval = setInterval(() => {
      setEntries((prev) =>
        prev.map((entry) => {
          let displaySeconds = 0;
          if (entry.startTime) {
            const start = new Date(entry.startTime).getTime();
            const end = entry.endTime
              ? new Date(entry.endTime).getTime()
              : entry.task?.running
              ? Date.now()
              : start;
            displaySeconds = Math.floor((end - start) / 1000);
          }
          return { ...entry, displaySeconds };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏱ Timer Display (top bar)
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

  // ⏱ Format seconds to HH:mm:ss
  const formatSeconds = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 🧭 Entry Controls
  const handleStart = async (entry) => {
    try {
      await API.put(`/tasks/${entry.task._id}/start`);
      fetchEntries();
    } catch (err) {
      console.error("Error starting timer:", err);
    }
  };

  const handlePause = async (entry) => {
    try {
      await API.put(`/tasks/${entry.task._id}/pause`);
      fetchEntries();
    } catch (err) {
      console.error("Error pausing timer:", err);
    }
  };

  const handleStop = async (entry) => {
    try {
      await API.put(`/tasks/${entry.task._id}/reset`);
      fetchEntries();
    } catch (err) {
      console.error("Error stopping timer:", err);
    }
  };

  // 👁 View
  const handleView = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
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

      {/* 🟡 Toolbar with Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          {/* 📅 Date range filter */}
          <div
            className="border rounded px-3 py-1 bg-light fw-bold"
            style={{ cursor: "pointer" }}
            onClick={() => setShowDateModal(true)}
          >
            {startDate && endDate
              ? `${moment(startDate).format("DD-MM-YYYY")} To ${moment(
                  endDate
                ).format("DD-MM-YYYY")}`
              : "Select Duration"}
          </div>

          {/* 👥 Employee Filter (Admin) */}
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">All Employees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
          {/* 🟡 ADDED — Clear Filters Button */}
          <button
            className="btn btn-outline-secondary"
            disabled={selectedUser === "all" && !startDate && !endDate}
            onClick={() => {
              setSelectedUser("all");
              setDateRange([null, null]);
            }}
          >
            <i className="fas fa-times me-1"></i> Clear Filters
          </button>
        </div>

        <button className="btn btn-primary">
          <i className="fas fa-plus me-1"></i> Log Time
        </button>
      </div>

      {/* Table */}
      <div className="card p-2 shadow-sm">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Employee</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <tr key={entry._id}>
                  <td>{index + 1}</td>
                  <td
                    className="text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleView(entry)}
                  >
                    {entry.task?.title || "--"}
                  </td>
                  <td>
                    {entry.user?.name || (
                      <i className="fas fa-user-circle text-secondary fs-5"></i>
                    )}
                  </td>
                  <td>
                    {moment(entry.startTime).format("DD-MM-YYYY hh:mm a")}
                  </td>
                  <td>
                    {entry.endTime
                      ? moment(entry.endTime).format("DD-MM-YYYY hh:mm a")
                      : entry.task?.running
                      ? "Running"
                      : "--"}
                  </td>
                  <td>{formatSeconds(entry.displaySeconds || 0)}</td>
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
                        {/** Optional admin edit/delete actions here */}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No timesheet entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
                <strong>Start:</strong>{" "}
                {moment(selectedEntry.startTime).format("DD-MM-YYYY hh:mm a")}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {selectedEntry.endTime
                  ? moment(selectedEntry.endTime).format("DD-MM-YYYY hh:mm a")
                  : selectedEntry.task?.running
                  ? "Running"
                  : "--"}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {formatSeconds(selectedEntry.displaySeconds || 0)}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Timesheet;
