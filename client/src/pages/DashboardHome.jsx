import React, { useEffect, useState, useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import API from "../api/api";
import moment from "moment";

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

  // 🕒 Auto update time every 60s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 📡 Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [taskRes, projectRes, attRes, todayRes] = await Promise.all([
        API.get("/tasks/summary"),
        API.get("/projects/summary"),
        API.get("/attendance/status"),
        API.get("/tasks/today"), // 👉 Only today's tasks
      ]);

      setTaskSummary(taskRes.data);
      setProjectSummary(projectRes.data);
      setAttendance(attRes.data);
      setTodayTasks(todayRes.data);
    } catch (err) {
      console.error("Dashboard data fetch error", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ⏰ Clock In/Out
  const handleClockIn = async () => {
    try {
      await API.post("/attendance/clockin");
      fetchDashboardData();
    } catch (err) {
      console.error("Clock In failed", err);
    }
  };

  const handleClockOut = async () => {
    try {
      await API.post("/attendance/clockout");
      fetchDashboardData();
    } catch (err) {
      console.error("Clock Out failed", err);
    }
  };

  return (
    <div className="container-fluid">
      {/* 🧭 Top Section */}
      <div className="row mb-4">
        {/* 👤 User Info */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card p-3 shadow-sm h-100">
            <div className="d-flex align-items-center">
              <div className="rounded-circle bg-secondary text-white p-3 me-3 fs-4">
                {user?.name?.[0]?.toUpperCase()}
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
              <div className="fw-bold fs-5">{moment(now).format("hh:mm A")}</div>
              <div className="text-muted small">{moment(now).format("dddd")}</div>
              {attendance?.clockIn && !attendance?.clockOut && (
                <div className="small text-muted">
                  Clocked in at: {moment(attendance.clockIn).format("hh:mm A")}
                </div>
              )}
            </div>

            <div className="text-end">
              {attendance?.clockIn && !attendance?.clockOut ? (
                <button className="btn btn-danger btn-sm" onClick={handleClockOut}>
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
                            task.status.toLowerCase() === "incomplete" ? "text-danger" : "text-success"
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



