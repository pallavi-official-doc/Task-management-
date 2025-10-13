import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import API from "../api/api";
import moment from "moment";


const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  // 🧠 State
  const [taskSummary, setTaskSummary] = useState({ pending: 0, completed: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [appreciations, setAppreciations] = useState([]);
  const [onLeave, setOnLeave] = useState([]);
  const [wfh, setWfh] = useState([]);
  const [attendance, setAttendance] = useState(null);

  // ⏱ Clock In/Out Handlers
  const handleClockIn = async () => {
    try {
      await API.post("/attendance/clockin");
      const res = await API.get("/attendance/status");
      setAttendance(res.data);
    } catch (err) {
      console.error("Clock In failed", err);
    }
  };

  const handleClockOut = async () => {
    try {
      await API.post("/attendance/clockout");
      const res = await API.get("/attendance/status");
      setAttendance(res.data);
    } catch (err) {
      console.error("Clock Out failed", err);
    }
  };

  // 📡 Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          summaryRes,
          taskRes,
          projRes,
          bdayRes,
          appRes,
          leaveRes,
          wfhRes,
          attRes,
        ] = await Promise.all([
          API.get("/tasks/summary"),             // ✅ Task counts
          API.get("/tasks?limit=5"),            // ✅ Last 5 tasks for table
          API.get("/projects"),                 // ✅ Projects
          API.get("/employees/birthdays"),      // ✅ Birthdays
          API.get("/employees/appreciations"),  // ✅ Appreciations
          API.get("/employees/onleave"),       // ✅ On Leave
          API.get("/employees/wfh"),           // ✅ WFH
          API.get("/attendance/status"),        // ✅ Attendance
        ]);

        setTaskSummary(summaryRes.data);
        setTasks(taskRes.data);
        setProjects(projRes.data);
        setBirthdays(bdayRes.data);
        setAppreciations(appRes.data);
        setOnLeave(leaveRes.data);
        setWfh(wfhRes.data);
        setAttendance(attRes.data);
      } catch (err) {
        console.error("Dashboard data fetch error", err);
      }
    };

    fetchData();
  }, []);
  const refreshTasks = async () => {
  try {
    const res = await API.get("/tasks?limit=5");
    setTasks(res.data);
  } catch (err) {
    console.error("Failed to refresh tasks", err);
  }
};


  return (
    <div className="container-fluid">
      {/* 🧭 Top Section */}
      <div className="row mb-4">
        {/* User Card */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-secondary text-white p-3 me-3 fs-4">
                {user?.name?.[0].toUpperCase()}
              </div>
              <div>
                <h6 className="mb-0">{user?.name}</h6>
                <small className="text-muted">{user?.designation || "Intern"}</small>
                <div className="small text-muted">Employee ID: {user?.employeeCode || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Summary */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Tasks</h6>
            <div className="d-flex justify-content-between">
              <span>Pending</span>
              <span className="fw-bold text-primary">{taskSummary.pending}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Completed</span>
              <span className="fw-bold text-success">{taskSummary.completed}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Overdue</span>
              <span className="fw-bold text-danger">{taskSummary.overdue}</span>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Projects</h6>
            <div className="d-flex justify-content-between">
              <span>In Progress</span>
              <span className="fw-bold text-primary">
                {projects.filter(p => p.status === "Active").length}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Overdue</span>
              <span className="fw-bold text-danger">
                {projects.filter(p => p.status === "Overdue").length}
              </span>
            </div>
          </div>
        </div>

        {/* Clock In / Out */}
        <div className="col-md-3 d-flex flex-column justify-content-center align-items-end">
          {attendance?.clockIn && !attendance?.clockOut ? (
            <>
              <div className="fw-bold fs-5 mb-2">
                {moment(attendance.clockIn).format("hh:mm A")}
              </div>
              <button className="btn btn-danger" onClick={handleClockOut}>Clock Out</button>
            </>
          ) : (
            <button className="btn btn-success" onClick={handleClockIn}>Clock In</button>
          )}
        </div>
      </div>

      {/* 📊 Middle Section */}
      <div className="row mb-4">
        {/* 📊 My Recent Tasks */}
<div className="col-md-6">
  <div className="card p-3 shadow-sm h-100">
    <h6>My Recent Tasks</h6>
    <table className="table table-sm mt-2">
      <thead>
        <tr>
          <th>Timer</th>
          <th>Task</th>
          <th>Status</th>
          <th>Due</th>
        </tr>
      </thead>
      <tbody>
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const getElapsed = () => {
              if (task.running && task.lastStartedAt) {
                const extra = Date.now() - new Date(task.lastStartedAt).getTime();
                return task.totalSeconds * 1000 + extra;
              }
              return task.totalSeconds * 1000;
            };

            const formatTime = (ms) => {
              const totalSeconds = Math.floor(ms / 1000);
              const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
              const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
              const s = String(totalSeconds % 60).padStart(2, "0");
              return `${h}:${m}:${s}`;
            };

            const startTimer = async () => {
              await API.put(`/tasks/${task._id}/start`);
              refreshTasks();
            };

            const pauseTimer = async () => {
              await API.put(`/tasks/${task._id}/pause`);
              refreshTasks();
            };

            const resetTimer = async () => {
              await API.put(`/tasks/${task._id}/reset`);
              refreshTasks();
            };

            return (
              <tr key={task._id}>
                {/* ✅ Timer Column */}
                <td>
                  <div className="d-flex align-items-center gap-1">
                    {!task.running ? (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={startTimer}
                        title="Start"
                      >
                        <i className="fas fa-play"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={pauseTimer}
                        title="Pause"
                      >
                        <i className="fas fa-pause"></i>
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={resetTimer}
                      title="Reset"
                    >
                      <i className="fas fa-stop"></i>
                    </button>

                    <span className="badge bg-primary">
                      {formatTime(getElapsed())}
                    </span>
                  </div>
                </td>

                {/* Other Columns */}
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>{task.dueDate ? moment(task.dueDate).format("MMM DD") : "-"}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="4" className="text-center text-muted">
              No tasks found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      </div>

      {/* 🧍 Bottom Section */}
      <div className="row">
        {/* Birthdays */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Birthdays</h6>
            <ul className="list-group list-group-flush mt-2">
              {birthdays.length ? birthdays.map(b => (
                <li key={b._id} className="list-group-item d-flex justify-content-between">
                  <span>{b.name}</span>
                  <span>{moment(b.birthday).format("MMM DD")}</span>
                </li>
              )) : <li className="list-group-item text-muted small">No upcoming birthdays</li>}
            </ul>
          </div>
        </div>

        {/* Appreciations */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Employee Appreciations</h6>
            <ul className="list-group list-group-flush mt-2">
              {appreciations.length ? appreciations.map(a => (
                <li key={a._id} className="list-group-item d-flex justify-content-between">
                  <span>{a.user?.name}</span>
                  <span className="badge bg-info">{a.title}</span>
                </li>
              )) : <li className="list-group-item text-muted small">No appreciations</li>}
            </ul>
          </div>
        </div>

        {/* On Leave */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>On Leave Today</h6>
            <ul className="list-group list-group-flush mt-2">
              {onLeave.length ? onLeave.map(e => (
                <li key={e._id} className="list-group-item">{e.name}</li>
              )) : <li className="list-group-item text-muted small">No one is on leave</li>}
            </ul>
          </div>
        </div>

        {/* WFH */}
        <div className="col-md-3">
          <div className="card p-3 shadow-sm h-100">
            <h6>Work From Home Today</h6>
            <ul className="list-group list-group-flush mt-2">
              {wfh.length ? wfh.map(e => (
                <li key={e._id} className="list-group-item">{e.name}</li>
              )) : <li className="list-group-item text-muted small">No WFH records</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;


