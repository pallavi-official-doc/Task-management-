// import React, { useEffect, useState, useContext, useCallback } from "react";
// // import { getAwardIcon } from "../utils/awardIcons";

// import AuthContext from "../context/AuthContext";

// import moment from "moment";
// import { DashboardAPI } from "../api/api";
// import API from "../api/api";



// const DashboardHome = () => {
//   const { user } = useContext(AuthContext);

//   // 📌 States
//   const [taskSummary, setTaskSummary] = useState({
//     pending: 0,
//     doing: 0,
//     completed: 0,
//     overdue: 0,
//   });
//   const [projectSummary, setProjectSummary] = useState({
//     active: 0,
//     overdue: 0,
//   });
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [attendance, setAttendance] = useState(null);
//   const [now, setNow] = useState(new Date()); // 🕒 Auto-updating clock
//   const [weeklyLogs, setWeeklyLogs] = useState([]); // 📅 Weekly Timelog
// const [weekTotal, setWeekTotal] = useState(0);// Active Day Data for progress bar
// const [activeDayData, setActiveDayData] = useState(null);
// const [durationPercent, setDurationPercent] = useState(0);
//  const [recentAwards, setRecentAwards] = useState([]);

//   useEffect(() => {
//     const fetchRecentAwards = async () => {
//       try {
//         const res = await API.get("/appreciations/recent");
//         setRecentAwards(res.data);
//       } catch (error) {
//         console.error("Error fetching recent awards:", error);
//       }
//     };

//     fetchRecentAwards();
//   }, []);

//   // 🕒 Auto update time every 60s
//   useEffect(() => {
//     const interval = setInterval(() => setNow(new Date()), 60000);
//     return () => clearInterval(interval);
//   }, []);

//  // 📡 Fetch dashboard data
// const fetchDashboardData = useCallback(async () => {
//   try {
//     const [
//       taskRes,
//       projectRes,
//       attRes,
//       todayRes,
//       weekLogRes
//     ] = await Promise.all([
//       DashboardAPI.getTaskSummary(),
//       DashboardAPI.getProjectSummary(),
//       DashboardAPI.getAttendanceStatus(),
//      DashboardAPI.getTodayTasks("all"), 
      
//       DashboardAPI.getWeeklyTimelogs(), 
//         // 👉 calls /timesheets/weekly-summary
//     ]);

//     setTaskSummary(taskRes.data);
//     setProjectSummary(projectRes.data);
//     setAttendance(attRes.data);
//     setTodayTasks(todayRes.data);

//     // 🆕 Handle weekly summary structure
//     setWeeklyLogs(weekLogRes.data.weeklySummary || []);
//     setWeekTotal(weekLogRes.data.weekTotal || 0); // optional if you want total

//   } catch (err) {
//     console.error("Dashboard data fetch error", err);
//   }
// }, []);


//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

// const handleClockIn = async () => {
//   try {
//     console.log("🟡 Clock In button clicked");
//     const res = await DashboardAPI.clockIn();
//     console.log("🟢 Clock In success:", res.data);
//     fetchDashboardData();
//   } catch (err) {
//     console.error("❌ Clock In failed", err);
//   }
// };

// const handleClockOut = async () => {
//   try {
//     await DashboardAPI.clockOut();
//     fetchDashboardData();
//   } catch (err) {
//     console.error("Clock Out failed", err);
//   }
// };

// const handleActiveDay = useCallback(
//   (day) => {
//     setWeeklyLogs((prev) =>
//       prev.map((d) => ({ ...d, active: d.day === day }))
//     );

//     // Use the latest weeklyLogs from state here
//     setActiveDayData((prev) => {
//       const selected = weeklyLogs.find((d) => d.day === day);
//       if (!selected) return prev;

//       const totalMins = selected.duration + selected.break;
//       setDurationPercent(totalMins ? (selected.duration / totalMins) * 100 : 0);

//       return {
//         ...selected,
//         durationH: Math.floor(selected.duration / 60),
//         durationM: selected.duration % 60,
//         breakH: Math.floor(selected.break / 60),
//         breakM: selected.break % 60,
//       };
//     });
//   },
//   [weeklyLogs]
// );
// useEffect(() => {
//   if (weeklyLogs.length > 0) {
//     // Pick the active day from API if exists, else first day with logs
//     const firstActive = weeklyLogs.find((d) => d.active) || weeklyLogs[0];
//     if (firstActive) {
//       handleActiveDay(firstActive.day);
//     }
//   }
// }, [weeklyLogs, handleActiveDay]);
//   return (
//     <div className="container-fluid">
//       {/* 🧭 Top Section */}
//       <div className="row mb-4">
//         {/* 👤 User Info */}
//         <div className="col-lg-3 col-md-6 mb-3">
//           <div className="card p-3 shadow-sm h-100">
//             <div className="d-flex align-items-center">
//               <div className="rounded-circle bg-secondary text-white p-3 me-3 fs-4">
//                 {user?.name?.[0]?.toUpperCase()}
//               </div>
//               <div>
//                 <h6 className="mb-0">{user?.name}</h6>
//                 <small className="text-muted">{user?.designation || "Intern"}</small>
//                 <div className="small text-muted">ID: {user?.employeeCode || "N/A"}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 📊 Task + Project Summary */}
//         <div className="col-lg-5 col-md-6 mb-3">
//           <div className="card p-3 shadow-sm h-100 d-flex flex-row justify-content-between">
//             {/* Tasks */}
//             <div>
//               <h6>Tasks</h6>
//               <div className="d-flex justify-content-between small">
//                 <span>Pending</span>
//                 <span className="fw-bold text-primary">{taskSummary.pending}</span>
//               </div>
//               <div className="d-flex justify-content-between small">
//                 <span>Doing</span>
//                 <span className="fw-bold text-warning">{taskSummary.doing}</span>
//               </div>
//               <div className="d-flex justify-content-between small">
//                 <span>Completed</span>
//                 <span className="fw-bold text-success">{taskSummary.completed}</span>
//               </div>
//               <div className="d-flex justify-content-between small">
//                 <span>Overdue</span>
//                 <span className="fw-bold text-danger">{taskSummary.overdue}</span>
//               </div>
//             </div>

//             {/* Projects */}
//             <div>
//               <h6>Projects</h6>
//               <div className="d-flex justify-content-between small">
//                 <span>Active</span>
//                 <span className="fw-bold text-primary">{projectSummary.active}</span>
//               </div>
//               <div className="d-flex justify-content-between small">
//                 <span>Overdue</span>
//                 <span className="fw-bold text-danger">{projectSummary.overdue}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ⏱ Clock In / Out */}
//         <div className="col-lg-4 col-md-12 mb-3">
//           <div className="card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
//             <div className="text-end mb-2">
//               <div className="fw-bold fs-5">{moment(now).format("hh:mm A")}</div>
//               <div className="text-muted small">{moment(now).format("dddd")}</div>
//               {attendance?.clockIn && !attendance?.clockOut && (
//                 <div className="small text-muted">
//                   Clocked in at: {moment(attendance.clockIn).format("hh:mm A")}
//                 </div>
//               )}
//             </div>

//             <div className="text-end">
//               {attendance?.clockIn && !attendance?.clockOut ? (
//                 <button className="btn btn-danger btn-sm" onClick={handleClockOut}>
//                   <i className="fas fa-sign-out-alt me-1"></i> Clock Out
//                 </button>
//               ) : (
//                 <button className="btn btn-success btn-sm" onClick={handleClockIn}>
//                   <i className="fas fa-sign-in-alt me-1"></i> Clock In
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//  {/* 🏆 Employee Appreciations Section */}
// <div className="dashboard-section mt-4">
//   <h5 className="mb-3 fw-semibold">Employee Appreciations</h5>

//   {recentAwards.length === 0 ? (
//     <p className="text-muted">No appreciations available.</p>
//   ) : (
//     <div className="card p-3 shadow-sm">
//       {recentAwards.map((award, index) => (
//         <div
//           key={award._id || index}
//           className="d-flex justify-content-between align-items-center border-bottom py-2"
//         >
//           {/* Left: Employee Info */}
//           <div className="d-flex align-items-center">
//             <img
//               src={award.employee?.profileImage || "/default-avatar.png"}
//               alt={award.employee?.name}
//               className="rounded-circle me-3"
//               style={{ width: 45, height: 45, objectFit: "cover" }}
//             />
//             <div>
//               <div className="fw-semibold">
//                 {award.employee?.name || "N/A"}
//               </div>
//               <small className="text-muted">
//                 {award.employee?.designation || "Employee"}
//               </small>
//             </div>
//           </div>

//           {/* Center: Award Info */}
//           <div className="text-end">
//             <div className="fw-semibold">{award.awardName}</div>
//             <small className="text-muted">
//               {new Date(award.date).toLocaleDateString("en-GB")}
//             </small>
//           </div>

//           {/* Right: Trophy Icon */}
//           <div>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="22"
//               height="22"
//               fill={
//                 award.awardName.toLowerCase().includes("rising")
//                   ? "red"
//                   : "purple"
//               }
//               viewBox="0 0 24 24"
//             >
//               <path d="M21 3h-3V2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v4a5 5 0 0 0 5 5h.17A7.001 7.001 0 0 0 11 18.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7.001 7.001 0 0 0 16.83 13H17a5 5 0 0 0 5-5V4a1 1 0 0 0-1-1zM6 11a3 3 0 0 1-3-3V5h3v6zm15-3a3 3 0 0 1-3 3V5h3v3z" />
//             </svg>
//           </div>
//         </div>
//       ))}
//     </div>
//   )}
// </div>


  

//      {/* 📅 Weekly Timelogs */}
// <div className="row mb-4">
//   <div className="col-md-8">
//     <div className="card p-3 shadow-sm h-100">
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h6 className="mb-0">Week Timelogs</h6>
//         <span className="badge bg-light text-dark">
//           {weekTotal}h This Week
//         </span>
//       </div>

//       {/* Day Selector */}
//       <div className="d-flex justify-content-between mb-3">
//         {weeklyLogs.length > 0 ? (
//           weeklyLogs.map((log) => (
//             <div
//               key={log.day}
//               className="text-center flex-fill"
//               style={{ cursor: "pointer" }}
//               onClick={() => handleActiveDay(log.day)}
//             >
//               <div
//                 className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${
//                   log.active ? "bg-primary text-white" : "bg-light text-dark"
//                 }`}
//                 style={{
//                   width: 32,
//                   height: 32,
//                   fontSize: 13,
//                   transition: "0.3s",
//                 }}
//               >
//                 {log.day.slice(0, 2)}
//               </div>
//               <div className="small">{log.hours}h</div>
//             </div>
//           ))
//         ) : (
//           <div className="text-muted small">No logs yet</div>
//         )}
//       </div>

//       {/* Progress Bar */}
//       {activeDayData && (
//         <>
//           <div className="progress mb-2" style={{ height: 10 }}>
//             <div
//               className="progress-bar bg-primary"
//               role="progressbar"
//               style={{
//                 width: `${durationPercent}%`,
//                 transition: "width 0.5s ease",
//               }}
//               aria-valuenow={durationPercent}
//               aria-valuemin="0"
//               aria-valuemax="100"
//             ></div>
//           </div>

//           {/* Duration & Break Info */}
//           <div className="d-flex justify-content-between small text-muted">
//             <span>
//               Duration: {activeDayData.durationH}h {activeDayData.durationM}m
//             </span>
//             <span>
//               Break: {activeDayData.breakH}h {activeDayData.breakM}m
//             </span>
//           </div>
//         </>
//       )}
//     </div>
//   </div>
// </div>


//       {/* ⏱ My Active Timer */}
//       {attendance?.clockIn && !attendance?.clockOut && (
//         <div className="row mb-4">
//           <div className="col-md-8">
//             <div className="card p-3 shadow-sm h-100">
//               <h6>My Active Timer</h6>
//               <div>Start Time: {moment(attendance.clockIn).format("hh:mm A")}</div>
//               <div>
//                 Duration:{" "}
//                 {moment.utc(moment(now).diff(moment(attendance.clockIn))).format("HH:mm")}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 📋 My Tasks (Today) */}
//       <div className="row mb-4">
//         <div className="col-md-8">
//           <div className="card p-3 shadow-sm h-100">
//             <h6>My Tasks</h6>
//             <table className="table table-sm mt-2">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Task</th>
//                   <th>Status</th>
//                   <th>Due Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {todayTasks.length > 0 ? (
//                   todayTasks.map((task, index) => (
//                     <tr key={task._id}>
//                       <td>{index + 1}</td>
//                       <td>{task.title}</td>
//                       <td>
//                         <span
//                           className={`me-1 ${
//                             task.status.toLowerCase() === "incomplete"
//                               ? "text-danger"
//                               : "text-success"
//                           }`}
//                         >
//                           ●
//                         </span>
//                         {task.status}
//                       </td>
//                       <td>
//                         {task.dueDate ? moment(task.dueDate).format("MMM DD") : "-"}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" className="text-center text-muted">
//                       No tasks for today
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardHome;
import React, { useEffect, useState, useContext, useCallback } from "react";
// import { getAwardIcon } from "../utils/awardIcons";

import AuthContext from "../context/AuthContext";

import moment from "moment";
import { DashboardAPI } from "../api/api";
import API from "../api/api";



const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  // 📌 States
  const [taskSummary, setTaskSummary] = useState({
    pending: 0,
    doing: 0,
    completed: 0,
    overdue: 0,
  });
  const [projectSummary, setProjectSummary] = useState({
    active: 0,
    overdue: 0,
  });
  const [todayTasks, setTodayTasks] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [now, setNow] = useState(new Date()); // 🕒 Auto-updating clock
  const [weeklyLogs, setWeeklyLogs] = useState([]); // 📅 Weekly Timelog
const [weekTotal, setWeekTotal] = useState(0);// Active Day Data for progress bar
const [activeDayData, setActiveDayData] = useState(null);
const [durationPercent, setDurationPercent] = useState(0);
 const [recentAwards, setRecentAwards] = useState([]);
const [elapsedTime, setElapsedTime] = useState(0); // time in seconds
  useEffect(() => {
    const fetchRecentAwards = async () => {
      try {
        const res = await API.get("/appreciations/recent");
        setRecentAwards(res.data);
      } catch (error) {
        console.error("Error fetching recent awards:", error);
      }
    };

    fetchRecentAwards();
  }, []);

  // 🕒 Auto update time every 60s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage")); // update AuthContext instantly
    } catch (err) {
      console.error("❌ Failed to refresh user data:", err);
    }
  };

  fetchUserProfile();
}, []);

 // 📡 Fetch dashboard data
const fetchDashboardData = useCallback(async () => {
  try {
    const [
      taskRes,
      projectRes,
      attRes,
      todayRes,
      weekLogRes
    ] = await Promise.all([
      DashboardAPI.getTaskSummary(),
      DashboardAPI.getProjectSummary(),
      DashboardAPI.getAttendanceStatus(),
     DashboardAPI.getTodayTasks("all"), 
      
      DashboardAPI.getWeeklyTimelogs(), 
        // 👉 calls /timesheets/weekly-summary
    ]);

    setTaskSummary(taskRes.data);
    setProjectSummary(projectRes.data);
    setAttendance(attRes.data);
    setTodayTasks(todayRes.data);

    // 🆕 Handle weekly summary structure
    setWeeklyLogs(weekLogRes.data.weeklySummary || []);
    setWeekTotal(weekLogRes.data.weekTotal || 0); // optional if you want total

  } catch (err) {
    console.error("Dashboard data fetch error", err);
  }
}, []);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

const handleClockIn = async () => {
  try {
    console.log("🟡 Clock In button clicked");
    const res = await DashboardAPI.clockIn();
    console.log("🟢 Clock In success:", res.data);
    fetchDashboardData();
  } catch (err) {
    console.error("❌ Clock In failed", err);
  }
};

const handleClockOut = async () => {
  try {
    await DashboardAPI.clockOut();
    fetchDashboardData();
  } catch (err) {
    console.error("Clock Out failed", err);
  }
};
// 🕒 Live Timer effect
useEffect(() => {
  let interval;

  if (attendance?.clockIn && !attendance?.clockOut) {
    // calculate already elapsed time since clockIn
    const initialElapsed =
      (new Date() - new Date(attendance.clockIn)) / 1000;
    setElapsedTime(initialElapsed);

    // start interval to keep timer running
    interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  } else {
    setElapsedTime(0);
  }

  return () => clearInterval(interval);
}, [attendance]);

const handleActiveDay = useCallback(
  (day) => {
    setWeeklyLogs((prev) =>
      prev.map((d) => ({ ...d, active: d.day === day }))
    );

    // Use the latest weeklyLogs from state here
    setActiveDayData((prev) => {
      const selected = weeklyLogs.find((d) => d.day === day);
      if (!selected) return prev;

      const totalMins = selected.duration + selected.break;
      setDurationPercent(totalMins ? (selected.duration / totalMins) * 100 : 0);

      return {
        ...selected,
        durationH: Math.floor(selected.duration / 60),
        durationM: selected.duration % 60,
        breakH: Math.floor(selected.break / 60),
        breakM: selected.break % 60,
      };
    });
  },
  [weeklyLogs]
);
useEffect(() => {
  if (weeklyLogs.length > 0) {
    // Pick the active day from API if exists, else first day with logs
    const firstActive = weeklyLogs.find((d) => d.active) || weeklyLogs[0];
    if (firstActive) {
      handleActiveDay(firstActive.day);
    }
  }
}, [weeklyLogs, handleActiveDay]);
  return (
    <div className="container-fluid">
      {/* 🧭 Top Section */}
      <div className="row mb-4">
        {/* 👤 User Info */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card p-3 shadow-sm h-100">
         <div className="d-flex align-items-center">
  <div className="me-3">
    {user?.profileImage ? (
      <img
        src={user.profileImage.startsWith("http")
          ? user.profileImage
          : `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${user.profileImage}`}
        alt="Profile"
        className="rounded-circle"
        style={{ width: 48, height: 48, objectFit: "cover" }}
      />
    ) : (
      <div className="rounded-circle bg-secondary text-white p-3 fs-4">
        {user?.name?.[0]?.toUpperCase()}
      </div>
    )}
  </div>

  <div>
    <h6 className="mb-0">{user?.name}</h6>
    <small className="text-muted">{user?.designation || "Intern"}</small>
    <div className="small text-muted">ID: {user?.employeeCode || "N/A"}</div>
  </div>
</div>

          </div>
        </div>

        {/* 📊 Task + Project Summary */}
        <div className="col-lg-5 col-md-6 mb-3">
          <div className="card p-3 shadow-sm h-100 d-flex flex-row justify-content-between">
            {/* Tasks */}
            <div>
              <h6>Tasks</h6>
              <div className="d-flex justify-content-between small">
                <span>Pending</span>
                <span className="fw-bold text-primary">{taskSummary.pending}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>Doing</span>
                <span className="fw-bold text-warning">{taskSummary.doing}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>Completed</span>
                <span className="fw-bold text-success">{taskSummary.completed}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>Overdue</span>
                <span className="fw-bold text-danger">{taskSummary.overdue}</span>
              </div>
            </div>

            {/* Projects */}
            <div>
              <h6>Projects</h6>
              <div className="d-flex justify-content-between small">
                <span>Active</span>
                <span className="fw-bold text-primary">{projectSummary.active}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span>Overdue</span>
                <span className="fw-bold text-danger">{projectSummary.overdue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ⏱ Clock In / Out */}
    <div className="col-lg-4 col-md-12 mb-3">
  <div className="card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
    <div className="text-end mb-2">
      {/* Current system time */}
      <div className="fw-bold fs-5">{moment(now).format("hh:mm A")}</div>
      <div className="text-muted small">{moment(now).format("dddd")}</div>

      {/* Clock In / Clock Out info */}
      {attendance?.clockIn && (
        <div className="small text-muted">
          🟢 Clocked in at: {moment(attendance.clockIn).format("hh:mm A")}
        </div>
      )}

      {attendance?.clockOut && (
        <div className="small text-muted">
          🔴 Clocked out at: {moment(attendance.clockOut).format("hh:mm A")}
        </div>
      )}

      {/* Live Timer */}
      {attendance?.clockIn && !attendance?.clockOut && (
        <div className="fw-semibold text-primary mt-2">
          ⏱ Working Time:{" "}
          {String(Math.floor(elapsedTime / 3600)).padStart(2, "0")}:
          {String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, "0")}:
          {String(Math.floor(elapsedTime % 60)).padStart(2, "0")}
        </div>
      )}

      {/* Total Worked Duration */}
      {attendance?.clockIn && attendance?.clockOut && (
        <div className="small text-muted mt-2">
          ⏱ Worked:{" "}
          {moment
            .utc(moment(attendance.clockOut).diff(moment(attendance.clockIn)))
            .format("HH:mm:ss")}
        </div>
      )}
    </div>

    <div className="text-end">
      {attendance?.clockIn && !attendance?.clockOut ? (
        <button
          className="btn btn-danger btn-sm"
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
          }}
          onClick={handleClockOut}
        >
          <i className="fas fa-sign-out-alt me-1"></i> Clock Out
        </button>
      ) : (
        <button className="btn btn-success btn-sm" onClick={handleClockIn}>
          <i className="fas fa-sign-in-alt me-1"></i> Clock In
        </button>
      )}
    </div>
  </div>
</div>



      </div>
 {/* 🏆 Employee Appreciations Section */}
<div className="dashboard-section mt-4">
  <h5 className="mb-3 fw-semibold">Employee Appreciations</h5>

  {recentAwards.length === 0 ? (
    <p className="text-muted">No appreciations available.</p>
  ) : (
    <div className="card p-3 shadow-sm">
      {recentAwards.map((award, index) => (
        <div
          key={award._id || index}
          className="d-flex justify-content-between align-items-center border-bottom py-2"
        >
          {/* Left: Employee Info */}
          <div className="d-flex align-items-center">
            <img
              src={award.employee?.profileImage || "/default-avatar.png"}
              alt={award.employee?.name}
              className="rounded-circle me-3"
              style={{ width: 45, height: 45, objectFit: "cover" }}
            />
            <div>
              <div className="fw-semibold">
                {award.employee?.name || "N/A"}
              </div>
              <small className="text-muted">
                {award.employee?.designation || "Employee"}
              </small>
            </div>
          </div>

          {/* Center: Award Info */}
          <div className="text-end">
            <div className="fw-semibold">{award.awardName}</div>
            <small className="text-muted">
              {new Date(award.date).toLocaleDateString("en-GB")}
            </small>
          </div>

          {/* Right: Trophy Icon */}
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill={
                award.awardName.toLowerCase().includes("rising")
                  ? "red"
                  : "purple"
              }
              viewBox="0 0 24 24"
            >
              <path d="M21 3h-3V2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v4a5 5 0 0 0 5 5h.17A7.001 7.001 0 0 0 11 18.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7.001 7.001 0 0 0 16.83 13H17a5 5 0 0 0 5-5V4a1 1 0 0 0-1-1zM6 11a3 3 0 0 1-3-3V5h3v6zm15-3a3 3 0 0 1-3 3V5h3v3z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


  

     {/* 📅 Weekly Timelogs */}
<div className="row mb-4">
  <div className="col-md-8">
    <div className="card p-3 shadow-sm h-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Week Timelogs</h6>
        <span className="badge bg-light text-dark">
          {weekTotal}h This Week
        </span>
      </div>

      {/* Day Selector */}
      <div className="d-flex justify-content-between mb-3">
        {weeklyLogs.length > 0 ? (
          weeklyLogs.map((log) => (
            <div
              key={log.day}
              className="text-center flex-fill"
              style={{ cursor: "pointer" }}
              onClick={() => handleActiveDay(log.day)}
            >
              <div
                className={`rounded-circle mx-auto mb-1 d-flex align-items-center justify-content-center ${
                  log.active ? "bg-primary text-white" : "bg-light text-dark"
                }`}
                style={{
                  width: 32,
                  height: 32,
                  fontSize: 13,
                  transition: "0.3s",
                }}
              >
                {log.day.slice(0, 2)}
              </div>
              <div className="small">{log.hours}h</div>
            </div>
          ))
        ) : (
          <div className="text-muted small">No logs yet</div>
        )}
      </div>

      {/* Progress Bar */}
      {activeDayData && (
        <>
          <div className="progress mb-2" style={{ height: 10 }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{
                width: `${durationPercent}%`,
                transition: "width 0.5s ease",
              }}
              aria-valuenow={durationPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>

          {/* Duration & Break Info */}
          <div className="d-flex justify-content-between small text-muted">
            <span>
              Duration: {activeDayData.durationH}h {activeDayData.durationM}m
            </span>
            <span>
              Break: {activeDayData.breakH}h {activeDayData.breakM}m
            </span>
          </div>
        </>
      )}
    </div>
  </div>
</div>


      {/* ⏱ My Active Timer */}
      {attendance?.clockIn && !attendance?.clockOut && (
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card p-3 shadow-sm h-100">
              <h6>My Active Timer</h6>
              <div>Start Time: {moment(attendance.clockIn).format("hh:mm A")}</div>
              <div>
                Duration:{" "}
                {moment.utc(moment(now).diff(moment(attendance.clockIn))).format("HH:mm")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📋 My Tasks (Today) */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card p-3 shadow-sm h-100">
            <h6>My Tasks</h6>
            <table className="table table-sm mt-2">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {todayTasks.length > 0 ? (
                  todayTasks.map((task, index) => (
                    <tr key={task._id}>
                      <td>{index + 1}</td>
                      <td>{task.title}</td>
                      <td>
                        <span
                          className={`me-1 ${
                            task.status.toLowerCase() === "incomplete"
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          ●
                        </span>
                        {task.status}
                      </td>
                      <td>
                        {task.dueDate ? moment(task.dueDate).format("MMM DD") : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No tasks for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
