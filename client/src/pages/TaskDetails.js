// src/pages/TaskDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import moment from "moment";
import "@fortawesome/fontawesome-free/css/all.min.css";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  // 🕒 Restore timer state from localStorage on page load
  useEffect(() => {
    const savedTimer = localStorage.getItem(`task_timer_${id}`);
    if (savedTimer) {
      const data = JSON.parse(savedTimer);
      setDuration(data.baseElapsed || 0);
      if (data.isRunning) {
        const now = Date.now();
        const elapsed = Math.floor((now - data.startTime) / 1000);
        setDuration(data.baseElapsed + elapsed);
        setTimerRunning(true);
        startInterval();
      } else if (data.isPaused) {
        setTimerPaused(true);
      }
    }
  }, [id]);

  // ✅ Fetch task details from backend
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await API.get(`/tasks/${id}`);
        setTask(res.data);

        // If backend has stored timeSpent, sync it with local timer base
        if (res.data.timeSpent) {
          setDuration(res.data.timeSpent);
        }
      } catch (err) {
        console.error("Failed to load task details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
    return () => clearInterval(timerRef.current);
  }, [id]);

  // ⏱ Helper: start interval ticking
  const startInterval = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  // 🟢 Start Timer
  const handleStartTimer = async () => {
    try {
      await API.put(`/tasks/${id}/start`);
      setTimerRunning(true);
      setTimerPaused(false);

      const now = Date.now();
      localStorage.setItem(
        `task_timer_${id}`,
        JSON.stringify({
          isRunning: true,
          isPaused: false,
          startTime: now,
          baseElapsed: duration,
        })
      );

      startInterval();
    } catch (err) {
      console.error("Failed to start timer", err);
    }
  };

  // ⏸ Pause Timer (optional)
  const handlePauseTimer = async () => {
    try {
      await API.put(`/tasks/${id}/pause`);
      clearInterval(timerRef.current);
      setTimerRunning(false);
      setTimerPaused(true);

      localStorage.setItem(
        `task_timer_${id}`,
        JSON.stringify({
          isRunning: false,
          isPaused: true,
          baseElapsed: duration,
        })
      );
    } catch (err) {
      console.error("Failed to pause timer", err);
    }
  };

  // ⏹ Stop Timer
  const handleResetTimer = async () => {
    try {
      await API.put(`/tasks/${id}/reset`);
      clearInterval(timerRef.current);
      setTimerRunning(false);
      setTimerPaused(false);
      setDuration(0);

      localStorage.removeItem(`task_timer_${id}`);
    } catch (err) {
      console.error("Failed to reset timer", err);
    }
  };

  // ✅ Mark Complete
  const handleMarkComplete = async () => {
    try {
      await API.put(`/tasks/${id}`, { status: "completed" });
      setTask((prev) => ({ ...prev, status: "completed" }));
    } catch (err) {
      console.error("Failed to mark as complete", err);
    }
  };

  // 🕒 Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="p-3">Loading...</div>;
  if (!task) return <div className="p-3 text-danger">Task not found</div>;

  return (
    <div className="p-4">
      <h4 className="mb-3">{task.title}</h4>

      {/* Timer Controls */}
      <div className="d-flex align-items-center gap-2 mb-3">
        {task.status !== "completed" && (
          <button className="btn btn-success" onClick={handleMarkComplete}>
            <i className="fas fa-check me-1"></i> Mark As Complete
          </button>
        )}

        <div className="border rounded px-3 py-1 bg-light fw-bold">
          ⏱ {formatTime(duration)}
        </div>

        {!timerRunning && !timerPaused && (
          <button
            className="btn btn-outline-primary"
            onClick={handleStartTimer}
          >
            <i className="fas fa-play me-1"></i> Start Timer
          </button>
        )}
        {timerRunning && (
          <button
            className="btn btn-outline-secondary"
            onClick={handlePauseTimer}
          >
            <i className="fas fa-pause me-1"></i> Pause Timer
          </button>
        )}
        {timerPaused && (
          <button
            className="btn btn-outline-primary"
            onClick={handleStartTimer}
          >
            <i className="fas fa-play me-1"></i> Resume
          </button>
        )}
        {(timerRunning || timerPaused) && (
          <button className="btn btn-outline-danger" onClick={handleResetTimer}>
            <i className="fas fa-stop me-1"></i> Stop Timer
          </button>
        )}
      </div>

      {/* Task Details */}
      <div className="row">
        <div className="col-md-8">
          <div className="card p-3 shadow-sm">
            <table className="table mb-0">
              <tbody>
                <tr>
                  <th>Project</th>
                  <td>{task.project?.name || "—"}</td>
                </tr>
                <tr>
                  <th>Priority</th>
                  <td>
                    <span
                      className={`badge bg-${
                        task.priority === "high"
                          ? "danger"
                          : task.priority === "medium"
                          ? "warning text-dark"
                          : "secondary"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Assigned To</th>
                  <td>{task.assignedTo?.name || "—"}</td>
                </tr>
                <tr>
                  <th>Short Code</th>
                  <td>—</td>
                </tr>
                <tr>
                  <th>Milestones</th>
                  <td>—</td>
                </tr>
                <tr>
                  <th>Assigned By</th>
                  <td>{task.createdBy?.name || "—"}</td>
                </tr>
                <tr>
                  <th>Label</th>
                  <td>—</td>
                </tr>
                <tr>
                  <th>Task Category</th>
                  <td>—</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{task.description || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <div className="d-flex align-items-center mb-2">
              <span
                className={`me-2 rounded-circle ${
                  task.status === "completed"
                    ? "bg-success"
                    : task.status === "doing"
                    ? "bg-info"
                    : "bg-danger"
                }`}
                style={{ width: "10px", height: "10px" }}
              ></span>
              <strong className="text-capitalize">{task.status}</strong>
            </div>
            <p>
              <strong>Created On:</strong>{" "}
              {moment(task.createdAt).format("DD-MM-YYYY hh:mm a")}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {task.startDate
                ? moment(task.startDate).format("DD-MM-YYYY")
                : "—"}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {task.dueDate ? moment(task.dueDate).format("DD-MM-YYYY") : "—"}
            </p>
            <p>
              <strong>Hours Logged:</strong> {formatTime(duration)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
