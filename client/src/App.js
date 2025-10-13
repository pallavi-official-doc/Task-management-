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
// import AllTasks from "./pages/AllTasks";
import CreateTask from "./pages/CreateTask";
import Timesheet from "./pages/Timesheet"; // ✅ check file name
import Projects from "./pages/Projects"; // optional
import Tasks from "./pages/Tasks"; // optional
import DashboardHome from "./pages/DashboardHome";
import TasksPage from "./pages/TasksPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />

              <Route path="projects" element={<Projects />} />
              {/* <Route path="all-tasks" element={<AllTasks />} /> */}
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks" element={<Tasks />} />
              {/* <Route path="/dashboard/tasks" element={<TasksPage />} /> */}

              <Route path="create-task" element={<CreateTask />} />
              <Route path="timesheets" element={<Timesheet />} />
            </Route>

            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
