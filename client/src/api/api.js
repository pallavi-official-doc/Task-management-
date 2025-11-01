import axios from "axios";

// Axios instance
export const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Dashboard API helpers
export const DashboardAPI = {
  clockIn: () => API.post("/attendance/clock-in"),
  clockOut: () => API.post("/attendance/clock-out"),
  getAttendanceStatus: () => API.get("/attendance/status"),
  getTaskSummary: () => API.get("/tasks/summary"),
  getProjectSummary: () => API.get("/projects/summary"),
  getTodayTasks: (status) => API.get(`/tasks/today?status=${status}`),
  getWeeklyTimelogs: () => API.get("/timesheets/weekly-summary"),
};

export default API;
