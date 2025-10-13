import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import AuthContext from "../context/AuthContext";

const Timesheet = () => {
  const { user } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Fetch all timesheet entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await API.get("/timesheets"); // ✅ Make sure this endpoint exists in backend
        setEntries(res.data);
      } catch (err) {
        console.error("Error fetching timesheet entries:", err);
      }
    };
    fetchEntries();
  }, []);

  // Handle log time form submit
  const handleLogTime = async (e) => {
    e.preventDefault();
    if (!task || !startTime || !endTime) return;

    try {
      const res = await API.post("/timesheets", {
        task,
        startTime,
        endTime,
      });
      setEntries([...entries, res.data]);
      setTask("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error("Error logging time:", err);
    }
  };

  // Helper: calculate duration
  const calculateDuration = (start, end) => {
    const diffMs = new Date(end) - new Date(start);
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Timesheet</h3>
      </div>

      {/* Log Time Form */}
      <form
        className="card p-3 mb-4 shadow-sm bg-light"
        onSubmit={handleLogTime}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Task description"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="datetime-local"
              className="form-control"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="datetime-local"
              className="form-control"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              + Log Time
            </button>
          </div>
        </div>
      </form>

      {/* Timesheet Table */}
      <div className="card p-3 shadow-sm">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Employee</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <tr key={entry._id || index}>
                  <td>{index + 1}</td>
                  <td>{entry.task}</td>
                  <td>{user?.name}</td>
                  <td>{new Date(entry.startTime).toLocaleString()}</td>
                  <td>{new Date(entry.endTime).toLocaleString()}</td>
                  <td>{calculateDuration(entry.startTime, entry.endTime)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No entries logged yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timesheet;
