import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AllTasks from "./pages/AllTasks";
import CreateTask from "./pages/CreateTask";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect "/" to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/all-tasks" element={<AllTasks />} />
            <Route path="/create-task" element={<CreateTask />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
