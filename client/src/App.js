import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Layout
import DashboardLayout from "./pages/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard"; // Dashboard Home
import Leaves from "./pages/hr/Leaves";
import Attendance from "./pages/hr/Attendance";
import Holiday from "./pages/hr/Holiday";
import AppreciationPage from "./pages/hr/Appreciation";

import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import CreateTask from "./pages/CreateTask";
import Timesheet from "./pages/Timesheet";

import Tickets from "./pages/Tickets/TicketList";
import TicketDetails from "./pages/Tickets/TicketDetails";

import Events from "./pages/Events";
import ProfileSettings from "./pages/settings/ProfileSettings";
import NoticeBoard from "./pages/NoticeBoard";
import MessagesPage from "./pages/Messages/MessagesPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />

              {/* HR */}
              <Route path="hr/leaves" element={<Leaves />} />
              <Route path="hr/attendance" element={<Attendance />} />
              <Route path="hr/holiday" element={<Holiday />} />
              <Route path="hr/appreciation" element={<AppreciationPage />} />

              {/* Work */}
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="create-task" element={<CreateTask />} />
              <Route path="timesheets" element={<Timesheet />} />

              {/* Tickets */}
              <Route path="tickets" element={<Tickets />} />
              <Route path="tickets/:id" element={<TicketDetails />} />

              {/* Events */}
              <Route path="events" element={<Events />} />

              {/* Settings */}
              <Route path="settings/profile" element={<ProfileSettings />} />

              {/* Notice */}
              <Route path="notice-board" element={<NoticeBoard />} />

              {/* Chat */}
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
