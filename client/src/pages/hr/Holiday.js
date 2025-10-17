// import React, { useEffect, useState, useCallback, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import API from "../../api/api";
// import moment from "moment";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Holiday = () => {
//   const [events, setEvents] = useState([]);
//   const [search, setSearch] = useState("");

//   const [modalData, setModalData] = useState(null);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const currentYearRef = useRef(new Date().getFullYear());
//   const searchTimeoutRef = useRef(null);

//   // 🩶 Generate Weekly Off (Sunday) events - purely for display
//   const generateWeeklyOffs = (year) => {
//     const offs = [];
//     const start = new Date(year, 0, 1);
//     const end = new Date(year, 11, 31);
//     let current = new Date(start);

//     while (current <= end) {
//       if (current.getDay() === 0) {
//         offs.push({
//           title: "Weekly Off",
//           start: current.toISOString().split("T")[0],
//           allDay: true,
//           backgroundColor: "#9e9e9e",
//           borderColor: "#9e9e9e",
//           textColor: "#fff",
//           editable: false,
//         });
//       }
//       current.setDate(current.getDate() + 1);
//     }

//     return offs;
//   };

//   // 🟩 Fetch Holidays from backend + Weekly Offs + Gov
//   const fetchAllHolidays = useCallback(
//     async (year = new Date().getFullYear(), query = "") => {
//       try {
//         // ✅ Fetch company & optional holidays from backend
//         const res = await API.get(`/holidays?year=${year}&search=${query}`);
//         const backendHolidays = res.data.map((h) => {
//           let bg = "#1976d2"; // Company default
//           if (h.type === "government") bg = "#4caf50";
//           if (h.isOptional) bg = "#fbc02d";

//           return {
//             id: h._id,
//             title: h.name,
//             start: h.date,
//             allDay: true,
//             backgroundColor: bg,
//             borderColor: bg,
//             textColor: "#fff",
//             extendedProps: h,
//           };
//         });

//         // 🩶 Generate weekly offs (Sundays)
//         const weeklyOffs = generateWeeklyOffs(year);

//         // 🟩 Government Holidays (backend)
//         const govRes = await API.get(`/holidays/gov/${year}`);
//         const govData = govRes.data || [];
//         const governmentHolidays = govData.map((h) => ({
//           title: h.name,
//           start: h.date,
//           allDay: true,
//           backgroundColor: "#4caf50",
//           borderColor: "#4caf50",
//           textColor: "#fff",
//         }));

//         // ✅ Merge all events
//         setEvents([...backendHolidays, ...weeklyOffs, ...governmentHolidays]);
//       } catch (err) {
//         console.error("❌ Error fetching holidays", err);
//       }
//     },
//     []
//   );

//   // 🧠 On Mount
//   useEffect(() => {
//     fetchAllHolidays(currentYearRef.current);
//     const role = localStorage.getItem("userRole");
//     setIsAdmin(role === "admin");
//   }, [fetchAllHolidays]);

//   // 🔍 Debounced Search
//   const handleSearch = (e) => {
//     const value = e.target.value;
//     setSearch(value);
//     clearTimeout(searchTimeoutRef.current);
//     searchTimeoutRef.current = setTimeout(() => {
//       fetchAllHolidays(currentYearRef.current, value);
//     }, 300);
//   };

//   // 📅 Handle Year Change in Calendar
//   const handleDatesSet = async (arg) => {
//     const newYear = arg.start.getFullYear();
//     if (newYear !== currentYearRef.current) {
//       currentYearRef.current = newYear;
//       fetchAllHolidays(newYear, search);
//     }
//   };

//   // 📌 Admin: Date Click → Open Create Modal
//   const handleDateClick = (arg) => {
//     if (!isAdmin) return;
//     setModalData({
//       mode: "create",
//       date: arg.dateStr,
//       name: "",
//       type: "company",
//       isOptional: false,
//       isRecurring: false,
//       location: "",
//       description: "",
//     });
//   };

//   // 📌 Admin: Event Click → Open Edit Modal
//   const handleEventClick = (info) => {
//     if (!isAdmin || !info.event.extendedProps?._id) return;
//     setModalData({
//       mode: "edit",
//       ...info.event.extendedProps,
//     });
//   };

//   // ✅ Save Holiday (Create or Update)
//   const handleSaveHoliday = async () => {
//     try {
//       const payload = {
//         name: modalData.name,
//         date: moment(modalData.date).format("YYYY-MM-DD"),
//         type: modalData.type,
//         description: modalData.description,
//         isRecurring: modalData.isRecurring,
//         isOptional: modalData.isOptional,
//         location: modalData.location,
//       };

//       if (modalData.mode === "create") {
//         await API.post("/holidays", payload);
//       } else {
//         await API.put(`/holidays/${modalData._id}`, payload);
//       }

//       setModalData(null);
//       fetchAllHolidays(currentYearRef.current, search);
//     } catch (err) {
//       console.error("❌ Error saving holiday", err);
//     }
//   };

//   // 🗑 Delete Holiday
//   const handleDeleteHoliday = async () => {
//     try {
//       await API.delete(`/holidays/${modalData._id}`);
//       setModalData(null);
//       fetchAllHolidays(currentYearRef.current, search);
//     } catch (err) {
//       console.error("❌ Error deleting holiday", err);
//     }
//   };

//   return (
//     <div className="p-3">
//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
//         <h3>Holiday Calendar</h3>

//         <div className="d-flex gap-2 align-items-center">
//           <div className="input-group" style={{ maxWidth: "250px" }}>
//             <input
//               type="text"
//               className="form-control"
//               placeholder="Search holidays..."
//               value={search}
//               onChange={handleSearch}
//             />
//           </div>

//           {/* 🟤 Admin: Generate Weekly Offs */}
//           {isAdmin && (
//             <button
//               className="btn btn-outline-secondary btn-sm"
//               onClick={async () => {
//                 await API.post("/holidays/generate-weekly-offs", {
//                   year: currentYearRef.current,
//                 });
//                 fetchAllHolidays(currentYearRef.current, search);
//               }}
//             >
//               <i className="fas fa-sync-alt me-1"></i> Generate Weekly Offs
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="card p-3 shadow-sm">
//         {/* Legend */}
//         <div className="d-flex gap-4 flex-wrap align-items-center mb-3">
//           <Legend color="#4caf50" label="Government Holiday" />
//           <Legend color="#1976d2" label="Company Holiday" />
//           <Legend color="#fbc02d" label="Optional Holiday" />
//           <Legend color="#9e9e9e" label="Weekly Off" />
//         </div>

//         <FullCalendar
//           plugins={[dayGridPlugin, interactionPlugin]}
//           initialView="dayGridMonth"
//           headerToolbar={{
//             left: "prev,next today",
//             center: "title",
//             right: "dayGridMonth,dayGridWeek,dayGridDay,listWeek",
//           }}
//           events={events}
//           datesSet={handleDatesSet}
//           dateClick={handleDateClick}
//           eventClick={handleEventClick}
//           eventDisplay="block"
//           height="auto"
//         />
//       </div>

//       {/* Modal for Admin Create/Edit */}
//       {modalData && (
//         <HolidayModal
//           modalData={modalData}
//           setModalData={setModalData}
//           onSave={handleSaveHoliday}
//           onDelete={handleDeleteHoliday}
//         />
//       )}
//     </div>
//   );
// };

// // Legend Component
// const Legend = ({ color, label }) => (
//   <div className="d-flex align-items-center gap-2">
//     <span
//       className="rounded-circle"
//       style={{ backgroundColor: color, width: "14px", height: "14px" }}
//     ></span>
//     <small>{label}</small>
//   </div>
// );

// // Admin Modal Component
// const HolidayModal = ({ modalData, setModalData, onSave, onDelete }) => (
//   <div className="modal fade show d-block" tabIndex="-1">
//     <div className="modal-dialog">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">
//             {modalData.mode === "create" ? "Add Holiday" : "Edit Holiday"}
//           </h5>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() => setModalData(null)}
//           ></button>
//         </div>
//         <div className="modal-body">
//           <div className="mb-2">
//             <label>Name</label>
//             <input
//               type="text"
//               className="form-control"
//               value={modalData.name}
//               onChange={(e) =>
//                 setModalData({ ...modalData, name: e.target.value })
//               }
//             />
//           </div>
//           <div className="mb-2">
//             <label>Date</label>
//             <input
//               type="date"
//               className="form-control"
//               value={modalData.date?.substring(0, 10)}
//               onChange={(e) =>
//                 setModalData({ ...modalData, date: e.target.value })
//               }
//             />
//           </div>
//           <div className="mb-2">
//             <label>Type</label>
//             <select
//               className="form-select"
//               value={modalData.type}
//               onChange={(e) =>
//                 setModalData({ ...modalData, type: e.target.value })
//               }
//             >
//               <option value="company">Company</option>
//               <option value="government">Government</option>
//             </select>
//           </div>
//           <div className="form-check form-switch mb-2">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               checked={modalData.isOptional}
//               onChange={(e) =>
//                 setModalData({
//                   ...modalData,
//                   isOptional: e.target.checked,
//                 })
//               }
//             />
//             <label className="form-check-label">Optional Holiday</label>
//           </div>
//           <div className="form-check form-switch mb-2">
//             <input
//               className="form-check-input"
//               type="checkbox"
//               checked={modalData.isRecurring}
//               onChange={(e) =>
//                 setModalData({
//                   ...modalData,
//                   isRecurring: e.target.checked,
//                 })
//               }
//             />
//             <label className="form-check-label">Recurring Holiday</label>
//           </div>
//           <div className="mb-2">
//             <label>Location (optional)</label>
//             <input
//               type="text"
//               className="form-control"
//               value={modalData.location || ""}
//               onChange={(e) =>
//                 setModalData({ ...modalData, location: e.target.value })
//               }
//             />
//           </div>
//           <div className="mb-2">
//             <label>Description (optional)</label>
//             <textarea
//               className="form-control"
//               value={modalData.description || ""}
//               onChange={(e) =>
//                 setModalData({ ...modalData, description: e.target.value })
//               }
//             />
//           </div>
//         </div>
//         <div className="modal-footer">
//           {modalData.mode === "edit" && (
//             <button className="btn btn-danger me-auto" onClick={onDelete}>
//               <i className="fas fa-trash me-1"></i> Delete
//             </button>
//           )}
//           <button
//             className="btn btn-secondary"
//             onClick={() => setModalData(null)}
//           >
//             Cancel
//           </button>
//           <button className="btn btn-primary" onClick={onSave}>
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default Holiday;
import React, { useEffect, useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AuthContext from "../../context/AuthContext";
import API from "../../api/api";
import moment from "moment";
import { Modal } from "react-bootstrap";

const HolidayPage = () => {
  const { user } = useContext(AuthContext);
  const [holidays, setHolidays] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seedYear, setSeedYear] = useState(new Date().getFullYear());

  const [newHoliday, setNewHoliday] = useState({
    title: "",
    date: "",
    type: "government",
  });
  const [editHoliday, setEditHoliday] = useState(null);

  // 🟡 Fetch holidays
  const fetchHolidays = async () => {
    try {
      const res = await API.get("/holidays");
      setHolidays(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching holidays", err);
    }
  };

  // 🟦 Generate Weekly Offs (Sunday)
  const generateWeeklyOffs = () => {
    const offs = [];
    const start = moment().startOf("year");
    const end = moment().endOf("year");

    for (let d = start.clone(); d.isBefore(end); d.add(1, "day")) {
      if (d.day() === 0) {
        offs.push({
          _id: `weekly-${d.format("YYYY-MM-DD")}`,
          title: "Weekly Off",
          date: d.format("YYYY-MM-DD"),
          type: "weekly",
        });
      }
    }
    return offs;
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // 🟢 Events for FullCalendar
  const events = [
    ...holidays.map((h) => ({
      id: h._id,
      title: h.title,
      start: h.date,
      backgroundColor: h.type === "government" ? "#1976d2" : "#90caf9",
      borderColor: h.type === "government" ? "#1976d2" : "#90caf9",
      textColor: "#fff",
      extendedProps: { type: h.type },
    })),
    ...generateWeeklyOffs().map((w) => ({
      id: w._id,
      title: w.title,
      start: w.date,
      backgroundColor: "#90caf9",
      borderColor: "#90caf9",
      textColor: "#000",
      extendedProps: { type: "weekly" },
    })),
  ];

  // 📅 Admin can click empty date to create
  const handleDateClick = (info) => {
    if (user?.role !== "admin") return;
    setNewHoliday({ ...newHoliday, date: info.dateStr });
    setShowCreateModal(true);
  };

  // ✍️ Admin can click existing event to edit/delete
  const handleEventClick = (info) => {
    const { id, title, start, extendedProps } = info.event;
    if (extendedProps.type === "weekly") return; // weekly off not editable

    if (user?.role === "admin") {
      setEditHoliday({
        id,
        title,
        date: moment(start).format("YYYY-MM-DD"),
        type: extendedProps.type,
      });
      setShowEditModal(true);
    }
  };

  // ➕ Create holiday
  const handleCreateHoliday = async () => {
    try {
      await API.post("/holidays", newHoliday);
      setShowCreateModal(false);
      setNewHoliday({ title: "", date: "", type: "government" });
      fetchHolidays();
    } catch (err) {
      console.error("❌ Failed to create holiday", err);
    }
  };

  // 💾 Update holiday
  const handleUpdateHoliday = async () => {
    try {
      await API.put(`/holidays/${editHoliday.id}`, {
        title: editHoliday.title,
        date: editHoliday.date,
        type: editHoliday.type,
      });
      setShowEditModal(false);
      setEditHoliday(null);
      fetchHolidays();
    } catch (err) {
      console.error("❌ Failed to update holiday", err);
    }
  };

  // 🗑 Delete holiday
  const handleDeleteHoliday = async () => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;
    try {
      await API.delete(`/holidays/${editHoliday.id}`);
      setShowEditModal(false);
      setEditHoliday(null);
      fetchHolidays();
    } catch (err) {
      console.error("❌ Failed to delete holiday", err);
    }
  };

  return (
    <div className="p-3">
      <h4 className="mb-3">Holiday Calendar</h4>
      {user?.role === "admin" && (
        <div className="d-flex align-items-center mb-3 gap-2">
          <select
            className="form-select w-auto"
            value={seedYear}
            onChange={(e) => setSeedYear(e.target.value)}
          >
            {/* You can generate years dynamically or hardcode a few future years */}
            {[2024, 2025, 2026, 2027, 2028].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline-primary"
            onClick={async () => {
              try {
                const res = await API.post(
                  `/holidays/seed-weekly-offs?year=${seedYear}`
                );

                alert(res.data.message);
                fetchHolidays(); // refresh after seeding
              } catch (err) {
                console.error("❌ Failed to seed weekly offs", err);
                alert("Failed to seed weekly offs");
              }
            }}
          >
            Seed Weekly Offs for {seedYear}
          </button>
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Holiday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <label>Title</label>
            <input
              className="form-control"
              value={newHoliday.title}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, title: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label>Type</label>
            <select
              className="form-select"
              value={newHoliday.type}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, type: e.target.value })
              }
            >
              <option value="government">Government Holiday</option>
              <option value="weekly">Weekly Off</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleCreateHoliday}>
            Create
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Holiday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editHoliday && (
            <>
              <div className="mb-2">
                <label>Title</label>
                <input
                  className="form-control"
                  value={editHoliday.title}
                  onChange={(e) =>
                    setEditHoliday({ ...editHoliday, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editHoliday.date}
                  onChange={(e) =>
                    setEditHoliday({ ...editHoliday, date: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label>Type</label>
                <select
                  className="form-select"
                  value={editHoliday.type}
                  onChange={(e) =>
                    setEditHoliday({ ...editHoliday, type: e.target.value })
                  }
                >
                  <option value="government">Government Holiday</option>
                  <option value="weekly">Weekly Off</option>
                </select>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-danger me-auto"
            onClick={handleDeleteHoliday}
          >
            Delete
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleUpdateHoliday}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HolidayPage;
