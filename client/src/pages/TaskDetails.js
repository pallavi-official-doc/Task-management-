import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import moment from "moment";
import "@fortawesome/fontawesome-free/css/all.min.css";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  // 🟡 Fetch Task
  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setTask(res.data);
      setDuration(calculateDuration(res.data));
    } catch (err) {
      console.error("❌ Failed to fetch task", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Calculate live duration based on task.running & lastStartedAt
  const calculateDuration = (t) => {
    if (!t) return 0;
    let base = t.totalSeconds || 0;
    if (t.running && t.lastStartedAt) {
      const now = Date.now();
      const started = new Date(t.lastStartedAt).getTime();
      base += Math.floor((now - started) / 1000);
    }
    return base;
  };

  // ⏱ Live update every second
  useEffect(() => {
    fetchTask();

    intervalRef.current = setInterval(() => {
      setDuration((prev) => {
        if (task?.running && task?.lastStartedAt) {
          return calculateDuration(task);
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [id, task?.running]);

  // ▶ START Timer
  const handleStartTimer = async () => {
    try {
      await API.post(`/timesheets/start/${id}`);
      fetchTask();
    } catch (err) {
      console.error("❌ Failed to start timer", err);
    }
  };

  // ⏸ PAUSE Timer
  const handlePauseTimer = async () => {
    try {
      await API.put(`/timesheets/pause-by-task/${id}`);
      fetchTask();
    } catch (err) {
      console.error("❌ Failed to pause timer", err);
    }
  };

  // ⏹ STOP Timer
  const handleStopTimer = async () => {
    try {
      await API.put(`/timesheets/stop-by-task/${id}`);
      fetchTask();
    } catch (err) {
      console.error("❌ Failed to stop timer", err);
    }
  };

  // 🕒 Format seconds → HH:mm:ss
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
        <div className="border rounded px-3 py-1 bg-light fw-bold">
          ⏱ {formatTime(duration)}
        </div>

        {!task.running ? (
          <button
            className="btn btn-outline-primary"
            onClick={handleStartTimer}
          >
            <i className="fas fa-play me-1"></i> Start
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary"
            onClick={handlePauseTimer}
          >
            <i className="fas fa-pause me-1"></i> Pause
          </button>
        )}

        <button className="btn btn-outline-danger" onClick={handleStopTimer}>
          <i className="fas fa-stop me-1"></i> Stop
        </button>
      </div>

      {/* Task Info */}
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
                  <th>Status</th>
                  <td className="text-capitalize">{task.status}</td>
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
                  <th>Description</th>
                  <td>{task.description || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
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
              <strong>Total Logged:</strong> {formatTime(duration)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
