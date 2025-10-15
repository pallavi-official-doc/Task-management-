// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import PrivateRoute from "./components/PrivateRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Profile from "./pages/Profile";
// import AllTasks from "./pages/AllTasks";
// import CreateTask from "./pages/CreateTask";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Redirect "/" to dashboard or login */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />

//           {/* Public routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />

//           {/* Protected routes */}
//           <Route element={<PrivateRoute />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/all-tasks" element={<AllTasks />} />
//             <Route path="/create-task" element={<CreateTask />} />
//           </Route>
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
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
import Profile from "./pages/Profile";
import CreateTask from "./pages/CreateTask";
import Timesheet from "./pages/Timesheet";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import DashboardHome from "./pages/DashboardHome";
import TaskDetails from "./pages/TaskDetails";
import Leaves from "./pages/hr/Leaves";
import Attendance from "./pages/hr/Attendance";
import Holiday from "./pages/hr/Holiday";
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

              {/* 📁 Projects */}
              <Route path="projects" element={<Projects />} />

              {/* ✅ Tasks (Main Page) */}
              <Route path="tasks" element={<Tasks />} />

              {/* ✅ Task Details */}
              <Route path="tasks/:id" element={<TaskDetails />} />

              {/* 📝 Create / Edit Task */}
              <Route path="create-task" element={<CreateTask />} />

              {/* 🟡 HR Section */}
              <Route path="/dashboard/hr/leaves" element={<Leaves />} />

              <Route path="hr/attendance" element={<Attendance />} />

              <Route path="hr/holidays" element={<Holiday />} />

              {/* ⏱ Timesheet */}
              <Route path="timesheets" element={<Timesheet />} />
            </Route>

            {/* 👤 Profile */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 🚫 404 Fallback */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
