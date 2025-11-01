import React, { useState, useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { BsClockHistory, BsBell, BsSearch } from "react-icons/bs";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hrOpen, setHrOpen] = useState(true); // 👈 new state for HR
  const [workOpen, setWorkOpen] = useState(true);
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [messageOpen, setMessageOpen] = useState(true);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="d-flex bg-light min-vh-100">
      {/* Sidebar */}
      <aside
        className={`bg-white border-end shadow-sm p-3 d-flex flex-column ${
          sidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
        style={{
          width: sidebarOpen ? "240px" : "70px",
          transition: "width 0.3s",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <Link
            to="/dashboard"
            className="text-decoration-none fw-bold fs-5 text-dark"
          >
            {sidebarOpen ? "Task App" : "W"}
          </Link>
          <button
            className="btn btn-sm btn-light d-md-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="flex-grow-1">
          <ul className="nav flex-column gap-1">
            {/* Dashboard */}
            <li>
              <Link
                to="."
                className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                  location.pathname === "/dashboard"
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                📊{" "}
                <span className={sidebarOpen ? "" : "d-none"}>Dashboard</span>
              </Link>
            </li>

            {/* ✅ HR Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setHrOpen(!hrOpen)}
              >
                <span>HR</span>
                <FiChevronDown
                  className={`transition ${hrOpen ? "rotate-180" : ""}`}
                />
              </div>

              {hrOpen && (
                <ul className="nav flex-column ms-2">
                  <li>
                    <Link
                      to="hr/leaves"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/leaves")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🌿
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Leaves
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="hr/attendance"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("attendance")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🕒
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Attendance
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="hr/holiday"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/holiday")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📅
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Holiday
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="hr/appreciation"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("hr/appreciation")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      🏆
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Appreciation
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* WORK Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setWorkOpen(!workOpen)}
              >
                <span>WORK</span>
                <FiChevronDown
                  className={`transition ${workOpen ? "rotate-180" : ""}`}
                />
              </div>

              {workOpen && (
                <ul className="nav flex-column ms-2">
                  <li>
                    <Link
                      to="projects"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("projects")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📁
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Projects
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="tasks"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("tasks")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📝
                      <span className={sidebarOpen ? "" : "d-none"}>Tasks</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="timesheets"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("timesheets")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      ⏱️
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Timesheet
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                to="tickets"
                className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                  location.pathname.includes("tickets")
                    ? "bg-primary text-white"
                    : "text-dark"
                }`}
              >
                🎫
                <span className={sidebarOpen ? "" : "d-none"}>Tickets</span>
              </Link>
            </li>

            {/* ⚙️ Settings Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <span>SETTINGS</span>
                <FiChevronDown
                  className={`transition ${settingsOpen ? "rotate-180" : ""}`}
                />
              </div>

              {settingsOpen && (
                <ul className="nav flex-column ms-2">
                  <li>
                    <Link
                      to="settings/profile"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("settings/profile")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      ⚙️
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Profile Settings
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            {/* 📢 NOTICE Section */}
            <li className="mt-2">
              <div
                className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                style={{ cursor: "pointer" }}
                onClick={() => setNoticeOpen(!noticeOpen)}
              >
                <span>NOTICE</span>
                <FiChevronDown
                  className={`transition ${noticeOpen ? "rotate-180" : ""}`}
                />
              </div>

              {noticeOpen && (
                <ul className="nav flex-column ms-2">
                  <li>
                    <Link
                      to="notice-board"
                      className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                        location.pathname.includes("notice-board")
                          ? "bg-primary text-white"
                          : "text-dark"
                      }`}
                    >
                      📢
                      <span className={sidebarOpen ? "" : "d-none"}>
                        Notice Board
                      </span>
                    </Link>
                  </li>
                  {/* 💬 COMMUNICATION Section */}
                  <li className="mt-2">
                    <div
                      className="d-flex justify-content-between align-items-center px-2 py-1 text-muted small"
                      style={{ cursor: "pointer" }}
                      onClick={() => setMessageOpen(!messageOpen)}
                    >
                      <span>COMMUNICATION</span>
                      <FiChevronDown
                        className={`transition ${
                          messageOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {messageOpen && (
                      <ul className="nav flex-column ms-2">
                        <li>
                          <Link
                            to="messages"
                            className={`nav-link d-flex align-items-center gap-2 p-2 rounded ${
                              location.pathname.includes("messages")
                                ? "bg-primary text-white"
                                : "text-dark"
                            }`}
                          >
                            💬
                            <span className={sidebarOpen ? "" : "d-none"}>
                              Messages
                            </span>
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-top pt-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="bg-secondary text-white rounded-circle p-2">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div>
                <div className="fw-semibold">{user?.name}</div>
                <div className="small text-muted">Intern</div>
              </div>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-danger w-100"
            onClick={logout}
          >
            🚪 {sidebarOpen ? "Logout" : ""}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Top Header Bar */}
        <header className="bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <BsClockHistory className="text-muted" />
            <div className="small text-muted">
              Home •{" "}
              {location.pathname.split("/").slice(2).join(" • ") || "Dashboard"}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <BsBell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            </div>
            <BsSearch size={18} className="text-muted" />
          </div>
        </header>

        {/* Page Content */}
        <main
          className="p-4"
          style={{ backgroundColor: "#f5f6fa", minHeight: "100%" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
