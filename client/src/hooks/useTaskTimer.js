import { useEffect, useState, useRef } from "react";
import API from "../api/api";

export const useTaskTimer = (taskId) => {
  const [task, setTask] = useState(null);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);

  // Calculate total elapsed seconds based on backend
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

  // Fetch the task data
  const fetchTask = async () => {
    try {
      const res = await API.get(`/tasks/${taskId}`);
      setTask(res.data);
      setDuration(calculateDuration(res.data));
    } catch (err) {
      console.error("❌ Failed to fetch task", err);
    }
  };

  useEffect(() => {
    fetchTask();

    intervalRef.current = setInterval(() => {
      setDuration(calculateDuration(task));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [taskId, task?.running]);

  const startTimer = async () => {
    await API.put(`/tasks/${taskId}/start`);
    fetchTask();
  };

  const pauseTimer = async () => {
    await API.put(`/tasks/${taskId}/pause`);
    fetchTask();
  };

  const resetTimer = async () => {
    await API.put(`/tasks/${taskId}/reset`);
    fetchTask();
  };

  return { task, duration, startTimer, pauseTimer, resetTimer, fetchTask };
};
