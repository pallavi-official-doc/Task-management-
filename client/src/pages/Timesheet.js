// import React, { useState, useEffect, useCallback } from "react";
// import API from "../api/api";
// import moment from "moment";
// import { Modal } from "react-bootstrap";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { motion, AnimatePresence } from "framer-motion";

// // 🟡 Import new views
// import WeeklyTimesheet from "./timesheet/WeeklyTimesheet";
// import TimesheetCalendar from "./timesheet/TimesheetCalendar";

// const Timesheet = () => {
//   const [entries, setEntries] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedEntries, setSelectedEntries] = useState([]);
//   const [selectedEntry, setSelectedEntry] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [activeTimer, setActiveTimer] = useState(null);

//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState("all");
//   const [dateRange, setDateRange] = useState([null, null]);
//   const [startDate, endDate] = dateRange;
//   const [showDateModal, setShowDateModal] = useState(false);
//   const [durationFilter, setDurationFilter] = useState("today");
//   const [customRange, setCustomRange] = useState([null, null]); // for custom range

//   const [showFilterPanel, setShowFilterPanel] = useState(false);
//   const [filterProject, setFilterProject] = useState("all");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterInvoice, setFilterInvoice] = useState("all");

//   // 🟡 New state to control which view is active
//   const [activeView, setActiveView] = useState("list"); // 'list' | 'weekly' | 'calendar'
//   const getDateRangeFromFilter = () => {
//     const now = moment();
//     let start, end;

//     switch (durationFilter) {
//       case "today":
//         start = now.startOf("day");
//         end = now.endOf("day");
//         break;
//       case "last30":
//         start = now.clone().subtract(30, "days").startOf("day");
//         end = now.endOf("day");
//         break;
//       case "last90":
//         start = now.clone().subtract(90, "days").startOf("day");
//         end = now.endOf("day");
//         break;
//       case "thisMonth":
//         start = now.clone().startOf("month");
//         end = now.clone().endOf("month");
//         break;
//       case "lastMonth":
//         start = now.clone().subtract(1, "month").startOf("month");
//         end = now.clone().subtract(1, "month").endOf("month");
//         break;
//       case "custom":
//         start = customRange[0] ? moment(customRange[0]) : null;
//         end = customRange[1] ? moment(customRange[1]) : null;
//         break;
//       default:
//         start = null;
//         end = null;
//     }

//     return { start, end };
//   };

//   // 📡 Fetch timesheet entries
//   const fetchEntries = useCallback(async () => {
//     try {
//       let url = "/timesheets";
//       const params = [];

//       if (selectedUser !== "all") {
//         params.push(`user=${selectedUser}`);
//       }
//       if (startDate && endDate) {
//         params.push(
//           `start=${moment(startDate).format("YYYY-MM-DD")}&end=${moment(
//             endDate
//           ).format("YYYY-MM-DD")}`
//         );
//       }

//       if (params.length) {
//         url += "?" + params.join("&");
//       }

//       const res = await API.get(url);
//       setEntries(res.data);
//       const active = res.data.find((e) => e.task?.running === true);
//       setActiveTimer(active || null);
//     } catch (err) {
//       console.error("❌ Error fetching timesheet entries:", err);
//     }
//   }, [selectedUser, startDate, endDate]);

//   // 📡 Fetch projects
//   const fetchProjects = useCallback(async () => {
//     try {
//       const res = await API.get("/projects");
//       setProjects(res.data || []);
//     } catch (err) {
//       console.error("❌ Error fetching projects:", err);
//     }
//   }, []);

//   // 📡 Fetch users (admin)
//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await API.get("/users");
//       setUsers(res.data);
//     } catch (err) {
//       console.error("❌ Failed to fetch users", err);
//     }
//   }, []);

//   useEffect(() => {
//     fetchEntries();
//     fetchProjects();
//     fetchUsers();

//     const interval = setInterval(fetchEntries, 30000);
//     return () => clearInterval(interval);
//   }, [fetchEntries, fetchProjects]);

//   // ⏱ Live update display durations every second
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setEntries((prev) =>
//         prev.map((entry) => {
//           let displaySeconds = 0;
//           if (entry.startTime) {
//             const start = new Date(entry.startTime).getTime();
//             const end = entry.endTime
//               ? new Date(entry.endTime).getTime()
//               : entry.task?.running
//               ? Date.now()
//               : start;
//             displaySeconds = Math.floor((end - start) / 1000);
//           }
//           return { ...entry, displaySeconds };
//         })
//       );
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // ⏱ Timer Display
//   const getActiveTimerDisplay = () => {
//     if (!activeTimer) return "00:00:00";
//     const start = new Date(activeTimer.startTime);
//     const now = new Date();
//     const diffSec = Math.floor((now - start) / 1000);
//     const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
//     const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
//     const s = String(diffSec % 60).padStart(2, "0");
//     return `${h}:${m}:${s}`;
//   };

//   const formatSeconds = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleView = (entry) => {
//     setSelectedEntry(entry);
//     setShowModal(true);
//   };

//   // Filter logic
//   const filteredEntries = entries.filter((entry) => {
//     const matchesSearch = entry.task?.title
//       ?.toLowerCase()
//       .includes(search.toLowerCase());

//     const matchesProject =
//       filterProject === "all" || entry.task?.project?._id === filterProject;

//     const matchesStatus =
//       filterStatus === "all" || entry.task?.status === filterStatus;

//     const matchesInvoice =
//       filterInvoice === "all" ||
//       (filterInvoice === "yes"
//         ? entry.invoiceGenerated
//         : !entry.invoiceGenerated);

//     return matchesSearch && matchesProject && matchesStatus && matchesInvoice;
//   });

//   return (
//     <div className="p-3">
//       {/* 🧭 Breadcrumb + Timer */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <nav aria-label="breadcrumb">
//             <ol className="breadcrumb mb-0">
//               <li className="breadcrumb-item">
//                 <i className="fas fa-clock me-1"></i> Home
//               </li>
//               <li className="breadcrumb-item active" aria-current="page">
//                 Timesheet
//               </li>
//             </ol>
//           </nav>
//         </div>
//         <div className="border rounded px-3 py-1 bg-light fw-bold">
//           {getActiveTimerDisplay()}
//         </div>
//       </div>

//       {/* 🟡 Unified Toolbar (Filters + View Toggle) */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center gap-3">
//           {/* 📅 Date range filter */}
//           <div
//             className="border rounded px-3 py-1 bg-light fw-bold"
//             style={{ cursor: "pointer" }}
//             onClick={() => setShowDateModal(true)}
//           >
//             {startDate && endDate
//               ? `${moment(startDate).format("DD-MM-YYYY")} To ${moment(
//                   endDate
//                 ).format("DD-MM-YYYY")}`
//               : "Select Duration"}
//           </div>

//           {/* 👥 Employee Filter */}
//           <select
//             className="form-select"
//             style={{ width: "200px" }}
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.target.value)}
//           >
//             <option value="all">All Employees</option>
//             {users.map((u) => (
//               <option key={u._id} value={u._id}>
//                 {u.name}
//               </option>
//             ))}
//           </select>

//           {/* Clear Filters */}
//           <button
//             className="btn btn-outline-secondary"
//             disabled={selectedUser === "all" && !startDate && !endDate}
//             onClick={() => {
//               setSelectedUser("all");
//               setDateRange([null, null]);
//             }}
//           >
//             <i className="fas fa-times me-1"></i> Clear Filters
//           </button>
//         </div>

//         {/* 🟡 View Toggle Buttons */}
//         <div className="btn-group">
//           <button
//             className={`btn btn-sm ${
//               activeView === "list" ? "btn-dark" : "btn-light"
//             }`}
//             onClick={() => setActiveView("list")}
//             title="Timesheet List"
//           >
//             <i className="fas fa-list"></i>
//           </button>
//           <button
//             className={`btn btn-sm ${
//               activeView === "weekly" ? "btn-dark" : "btn-light"
//             }`}
//             onClick={() => setActiveView("weekly")}
//             title="Weekly Timesheet"
//           >
//             <i className="fas fa-calendar-week"></i>
//           </button>
//           <button
//             className={`btn btn-sm ${
//               activeView === "calendar" ? "btn-dark" : "btn-light"
//             }`}
//             onClick={() => setActiveView("calendar")}
//             title="Calendar View"
//           >
//             <i className="fas fa-calendar"></i>
//           </button>
//         </div>
//       </div>

//       {/* 🟡 Conditional Rendering of Views */}

//       {/* 1️⃣ Timesheet List View (existing table) */}
//       <AnimatePresence mode="wait">
//         {activeView === "list" && (
//           <motion.div
//             key="list-view"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.25 }}
//           >
//             <div className="card p-2 shadow-sm">
//               <table className="table align-middle mb-0">
//                 <thead>
//                   <tr>
//                     <th>#</th>
//                     <th>Task</th>
//                     <th>Employee</th>
//                     <th>Start</th>
//                     <th>End</th>
//                     <th>Duration</th>
//                     <th className="text-end">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredEntries.length > 0 ? (
//                     filteredEntries.map((entry, index) => (
//                       <tr key={entry._id}>
//                         <td>{index + 1}</td>
//                         <td
//                           className="text-primary"
//                           style={{ cursor: "pointer" }}
//                           onClick={() => handleView(entry)}
//                         >
//                           {entry.task?.title || "--"}
//                         </td>
//                         <td>
//                           {entry.user?.name || (
//                             <i className="fas fa-user-circle text-secondary fs-5"></i>
//                           )}
//                         </td>
//                         <td>
//                           {moment(entry.startTime).format("DD-MM-YYYY hh:mm a")}
//                         </td>
//                         <td>
//                           {entry.endTime
//                             ? moment(entry.endTime).format("DD-MM-YYYY hh:mm a")
//                             : entry.task?.running
//                             ? "Running"
//                             : "--"}
//                         </td>
//                         <td>{formatSeconds(entry.displaySeconds || 0)}</td>
//                         <td className="text-end">
//                           <div className="dropdown">
//                             <button
//                               className="btn btn-sm btn-outline-secondary"
//                               type="button"
//                               data-bs-toggle="dropdown"
//                             >
//                               <i className="fas fa-ellipsis-v"></i>
//                             </button>
//                             <ul className="dropdown-menu dropdown-menu-end">
//                               <li>
//                                 <button
//                                   className="dropdown-item d-flex align-items-center gap-2"
//                                   onClick={() => handleView(entry)}
//                                 >
//                                   <i className="fas fa-eye"></i> View
//                                 </button>
//                               </li>
//                             </ul>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="text-center text-muted">
//                         No timesheet entries found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>
//         )}

//         {activeView === "weekly" && (
//           <motion.div
//             key="weekly-view"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.25 }}
//           >
//             <WeeklyTimesheet entries={entries} />
//           </motion.div>
//         )}
//         {activeView === "calendar" && (
//           <motion.div
//             key="calendar-view"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.25 }}
//           >
//             <TimesheetCalendar />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* View Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Timesheet Entry</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedEntry && (
//             <>
//               <p>
//                 <strong>Task:</strong> {selectedEntry.task?.title}
//               </p>
//               <p>
//                 <strong>Start:</strong>{" "}
//                 {moment(selectedEntry.startTime).format("DD-MM-YYYY hh:mm a")}
//               </p>
//               <p>
//                 <strong>End:</strong>{" "}
//                 {selectedEntry.endTime
//                   ? moment(selectedEntry.endTime).format("DD-MM-YYYY hh:mm a")
//                   : selectedEntry.task?.running
//                   ? "Running"
//                   : "--"}
//               </p>
//               <p>
//                 <strong>Duration:</strong>{" "}
//                 {formatSeconds(selectedEntry.displaySeconds || 0)}
//               </p>
//             </>
//           )}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default Timesheet;
import React, { useState, useEffect, useCallback, useContext } from "react";
import API from "../api/api";
import moment from "moment";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import AuthContext from "../context/AuthContext";

// Views
import WeeklyTimesheet from "./timesheet/WeeklyTimesheet";
import TimesheetCalendar from "./timesheet/TimesheetCalendar";

const Timesheet = () => {
  const { user } = useContext(AuthContext);

  // Data
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // UI / filters
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);

  const [selectedUser, setSelectedUser] = useState("all");

  // Duration filter
  const [durationFilter, setDurationFilter] = useState("today"); // today | last30 | last90 | thisMonth | lastMonth | custom
  const [customRange, setCustomRange] = useState([null, null]); // [start, end] -> Date objects for custom range
  const [showDateModal, setShowDateModal] = useState(false);

  // Extra filters (kept from your file)
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInvoice, setFilterInvoice] = useState("all");

  // View
  const [activeView, setActiveView] = useState("list"); // 'list' | 'weekly' | 'calendar'

  // —————————————————————————————————————————————————————
  // Helpers
  const getDateRangeFromFilter = useCallback(() => {
    const now = moment();
    let start = null;
    let end = null;

    switch (durationFilter) {
      case "today":
        start = now.clone().startOf("day");
        end = now.clone().endOf("day");
        break;
      case "last30":
        start = now.clone().subtract(30, "days").startOf("day");
        end = now.clone().endOf("day");
        break;
      case "last90":
        start = now.clone().subtract(90, "days").startOf("day");
        end = now.clone().endOf("day");
        break;
      case "thisMonth":
        start = now.clone().startOf("month");
        end = now.clone().endOf("month");
        break;
      case "lastMonth":
        start = now.clone().subtract(1, "month").startOf("month");
        end = now.clone().subtract(1, "month").endOf("month");
        break;
      case "custom":
        if (customRange[0] && customRange[1]) {
          start = moment(customRange[0]).startOf("day");
          end = moment(customRange[1]).endOf("day");
        }
        break;
      default:
        break;
    }

    return { start, end };
  }, [durationFilter, customRange]);

  const formatSeconds = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  // —————————————————————————————————————————————————————
  // Fetching

  const fetchEntries = useCallback(async () => {
    try {
      let url = "/timesheets";
      const params = [];

      if (selectedUser !== "all") {
        params.push(`user=${selectedUser}`);
      }

      const { start, end } = getDateRangeFromFilter();
      if (start && end) {
        params.push(
          `start=${start.format("YYYY-MM-DD")}&end=${end.format("YYYY-MM-DD")}`
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
  }, [selectedUser, getDateRangeFromFilter]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch users", err);
    }
  }, []);

  // Load data on mount + when dependencies change
  useEffect(() => {
    // set default selected user for non-admin
    if (user && user.role !== "admin") {
      setSelectedUser(user._id);
    }
  }, [user]);
  // Load data on mount + when filters or selected user change
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries, durationFilter, customRange, selectedUser]);

  // Fetch projects & users once on mount
  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);

  // Auto refresh entries every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  // Live duration update each second
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

  // —————————————————————————————————————————————————————
  // UI handlers

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // Client-side extra filtering over fetched results
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

  // —————————————————————————————————————————————————————
  // Render

  return (
    <div className="p-3">
      {/* Breadcrumb + Timer */}
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
        {/* <div className="border rounded px-3 py-1 bg-light fw-bold">
          {getActiveTimerDisplay()}
        </div> */}
      </div>

      {/* Toolbar: Duration + Employee + Clear + View Toggle */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          {/* 📅 Duration Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-outline-dark dropdown-toggle"
              type="button"
              id="durationDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="Filter by duration"
            >
              {(() => {
                switch (durationFilter) {
                  case "today":
                    return "Today";
                  case "last30":
                    return "Last 30 Days";
                  case "last90":
                    return "Last 90 Days";
                  case "thisMonth":
                    return "This Month";
                  case "lastMonth":
                    return "Last Month";
                  case "custom": {
                    const [cs, ce] = customRange;
                    return cs && ce
                      ? `${moment(cs).format("DD-MM-YYYY")} to ${moment(
                          ce
                        ).format("DD-MM-YYYY")}`
                      : "Custom Range";
                  }
                  default:
                    return "Select Duration";
                }
              })()}
            </button>

            <ul className="dropdown-menu" aria-labelledby="durationDropdown">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setDurationFilter("today")}
                >
                  Today
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setDurationFilter("last30")}
                >
                  Last 30 Days
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setDurationFilter("last90")}
                >
                  Last 90 Days
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setDurationFilter("thisMonth")}
                >
                  This Month
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setDurationFilter("lastMonth")}
                >
                  Last Month
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDurationFilter("custom");
                    setShowDateModal(true);
                  }}
                >
                  Custom Range…
                </button>
              </li>
            </ul>
          </div>

          {/* 👥 Employee Filter (admin can pick; employees see self) */}
          <select
            className="form-select"
            style={{ width: "220px" }}
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            title="Filter by employee"
          >
            {user?.role === "admin" && (
              <option value="all">All Employees</option>
            )}
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* 🔍 Search by Task */}
          <input
            type="text"
            className="form-control"
            style={{ width: 260 }}
            placeholder="Search task…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Clear Filters */}
          <button
            className="btn btn-outline-secondary"
            disabled={
              (user?.role === "admin"
                ? selectedUser === "all"
                : selectedUser === user?._id) &&
              durationFilter === "today" &&
              !customRange[0] &&
              !customRange[1]
            }
            onClick={() => {
              if (user?.role === "admin") {
                setSelectedUser("all");
              } else if (user?._id) {
                setSelectedUser(user._id);
              }
              setDurationFilter("today");
              setCustomRange([null, null]);
              setSearch("");
              setFilterProject("all");
              setFilterStatus("all");
              setFilterInvoice("all");
            }}
            title="Clear filters"
          >
            <i className="fas fa-times me-1"></i> Clear
          </button>
        </div>

        {/* View Toggle */}
        <div className="btn-group">
          <button
            className={`btn btn-sm ${
              activeView === "list" ? "btn-dark" : "btn-light"
            }`}
            onClick={() => setActiveView("list")}
            title="Timesheet List"
          >
            <i className="fas fa-list"></i>
          </button>

          <button
            className={`btn btn-sm ${
              activeView === "weekly" ? "btn-dark" : "btn-light"
            }`}
            onClick={() => setActiveView("weekly")}
            title="Weekly Timesheet"
          >
            <i className="fas fa-calendar-week"></i>
          </button>

          <button
            className={`btn btn-sm ${
              activeView === "calendar" ? "btn-dark" : "btn-light"
            }`}
            onClick={() => setActiveView("calendar")}
            title="Calendar View"
          >
            <i className="fas fa-calendar"></i>
          </button>
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {activeView === "list" && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
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
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No timesheet entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeView === "weekly" && (
          <motion.div
            key="weekly-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* pass filtered entries so it respects employee + duration */}
            <WeeklyTimesheet entries={filteredEntries} />
          </motion.div>
        )}

        {activeView === "calendar" && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <TimesheetCalendar />
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Custom Range Modal */}
      <Modal
        show={showDateModal}
        onHide={() => setShowDateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Custom Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <DatePicker
              selectsRange
              startDate={customRange[0]}
              endDate={customRange[1]}
              onChange={(update) => setCustomRange(update)}
              isClearable
              inline
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setCustomRange([null, null]);
              setShowDateModal(false);
            }}
          >
            Clear
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              // ensure custom is selected
              setDurationFilter("custom");
              setShowDateModal(false);
              // refetch happens via dependency on customRange + durationFilter
              fetchEntries();
            }}
            disabled={!customRange[0] || !customRange[1]}
          >
            Apply
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Timesheet;
