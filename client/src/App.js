import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import CreateTask from "./pages/CreateTask";
import Timesheet from "./pages/Timesheet";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import DashboardHome from "./pages/DashboardHome";
import TaskDetails from "./pages/TaskDetails";
import Leaves from "./pages/hr/Leaves";
import Attendance from "./pages/hr/Attendance";
import Holiday from "./pages/hr/Holiday";
import AppreciationPage from "./pages/hr/Appreciation";
import ProfileSettings from "./pages/settings/ProfileSettings";

// ✅ Import Notice Board Page
import NoticeBoard from "./pages/NoticeBoard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🌐 Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 🌐 Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔐 Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              {/* 🏠 Dashboard Home */}
              <Route index element={<DashboardHome />} />

              {/* 🧑‍💼 HR Section */}
              <Route path="hr/leaves" element={<Leaves />} />
              <Route path="hr/attendance" element={<Attendance />} />
              <Route path="hr/holiday" element={<Holiday />} />
              <Route path="hr/appreciation" element={<AppreciationPage />} />

              {/* 💼 Work Section */}
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="create-task" element={<CreateTask />} />
              <Route path="timesheets" element={<Timesheet />} />

              {/* ⚙️ Settings Section */}
              <Route path="settings/profile" element={<ProfileSettings />} />

              {/* 📢 Notice Board Section */}
              <Route path="notice-board" element={<NoticeBoard />} />
            </Route>
          </Route>

          {/* 🚫 404 Fallback */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
