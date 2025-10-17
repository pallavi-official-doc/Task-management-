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
  // 📊 Dashboard widgets
  getTaskSummary: () => API.get("/tasks/summary"),
  getProjectSummary: () => API.get("/projects/summary"),

  // 🟢 Attendance APIs
  getAttendanceStatus: () => API.get("/attendance/today"), // ✅ Today's record
  clockIn: () => API.post("/attendance"), // ✅ Clock In
  clockOut: () => API.post("/attendance/clockout"), // ✅ Clock Out

  // 📅 Tasks
  getTodayTasks: (status = "doing") => API.get(`/tasks/today?status=${status}`),

  // ⏱ Weekly Timelogs
  getWeeklyTimelogs: () => API.get("/timesheets/weekly-summary"),
};

export default API;
