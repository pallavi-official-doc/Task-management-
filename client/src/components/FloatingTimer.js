import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { FaPause, FaPlay, FaStop } from "react-icons/fa";

const pad = (n) => n.toString().padStart(2, "0");
const formatTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
};

export default function FloatingTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timesheetId, setTimesheetId] = useState(null);
  const intervalRef = useRef(null);

  // ⏳ Load active timer on page load
  useEffect(() => {
    const loadActive = async () => {
      try {
        const { data } = await API.get("/timesheets/active");
        if (data) {
          setTimesheetId(data._id);
          setElapsed(data.elapsedSeconds);
          setIsRunning(true);
        }
      } catch (err) {
        console.error("❌ Failed to fetch active timer:", err);
      }
    };
    loadActive();
  }, []);

  // ⏱ Timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // ▶️ Start new timer
  const handleStart = async (taskId = null) => {
    try {
      const { data } = await API.post("/timesheets/start", { taskId });
      setTimesheetId(data._id);
      setElapsed(0);
      setIsRunning(true);
    } catch (err) {
      console.error("❌ Failed to start timer:", err);
    }
  };

  // ⏸ Pause timer
  const handlePause = async () => {
    try {
      await API.put(`/timesheets/pause/${timesheetId}`);
      setIsRunning(false);
    } catch (err) {
      console.error("❌ Failed to pause timer:", err);
    }
  };

  // ⏹ Stop timer
  const handleStop = async () => {
    try {
      await API.put(`/timesheets/stop/${timesheetId}`);
      setIsRunning(false);
      setElapsed(0);
      setTimesheetId(null);
    } catch (err) {
      console.error("❌ Failed to stop timer:", err);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        padding: "4px 8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        width: "100%",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: "14px" }}>
        {formatTime(elapsed)}
      </div>

      {isRunning ? (
        <button
          onClick={handlePause}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="Pause"
        >
          <FaPause size={14} color="#2563eb" />
        </button>
      ) : timesheetId ? (
        <button
          onClick={() => setIsRunning(true)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="Resume"
        >
          <FaPlay size={14} color="#2563eb" />
        </button>
      ) : (
        <button
          onClick={() => handleStart()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="Start"
        >
          <FaPlay size={14} color="#2563eb" />
        </button>
      )}

      {timesheetId && (
        <button
          onClick={handleStop}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="Stop"
        >
          <FaStop size={14} color="#dc2626" />
        </button>
      )}
    </div>
  );
}
