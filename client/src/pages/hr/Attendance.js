import React, { useState, useEffect, useCallback } from "react";
// import AuthContext from "../../context/AuthContext";
import API from "../../api/api";
import moment from "moment";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Attendance = () => {
  const [month, setMonth] = useState(moment().month() + 1);
  const [year, setYear] = useState(moment().year());
  const [attendanceData, setAttendanceData] = useState([]);

  const daysInMonth = moment({ year, month: month - 1 }).daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // ✅ Map status → FontAwesome icons
  const statusIcons = {
    Holiday: <i className="fas fa-star text-warning"></i>,
    "Day Off": <i className="fas fa-calendar-day text-secondary"></i>,
    Present: <i className="fas fa-check text-success"></i>,
    "Half Day": <i className="fas fa-sun text-warning"></i>,
    Late: <i className="fas fa-clock text-danger"></i>,
    Absent: <i className="fas fa-times text-danger"></i>,
    "On Leave": <i className="fas fa-plane text-info"></i>,
  };

  // ✅ Fetch Attendance Data
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await API.get(`/attendance?month=${month}&year=${year}`);
      setAttendanceData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch attendance", err);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // 🔸 Helper: get status for specific employee + date
  const getStatusForDay = (employee, day) => {
    const targetDate = moment({ year, month: month - 1, day }).format(
      "YYYY-MM-DD"
    );
    const dayRecord = employee.attendance?.find(
      (rec) => moment(rec.date).format("YYYY-MM-DD") === targetDate
    );
    if (!dayRecord) return <span>-</span>;
    return statusIcons[dayRecord.status] || <span>-</span>;
  };

  // 🔸 Helper: Count total Present per employee
  const getTotalPresent = (employee) =>
    employee.attendance?.filter((r) => r.status === "Present").length || 0;

  return (
    <div className="p-3">
      <h4>Attendance</h4>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <select
          className="form-select"
          style={{ maxWidth: "200px" }}
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
        >
          {moment.months().map((m, idx) => (
            <option key={m} value={idx + 1}>
              {m}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ maxWidth: "120px" }}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => moment().year() - 2 + i).map(
            (y) => (
              <option key={y} value={y}>
                {y}
              </option>
            )
          )}
        </select>
      </div>

      {/* Legend */}
      <div className="mb-2 small">
        <strong>Note:</strong> <i className="fas fa-star text-warning"></i>{" "}
        Holiday • <i className="fas fa-calendar-day text-secondary"></i> Day Off
        • <i className="fas fa-check text-success"></i> Present •{" "}
        <i className="fas fa-sun text-warning"></i> Half Day •{" "}
        <i className="fas fa-clock text-danger"></i> Late •{" "}
        <i className="fas fa-times text-danger"></i> Absent •{" "}
        <i className="fas fa-plane text-info"></i> On Leave
      </div>

      {/* Table */}
      <div className="card p-3 shadow-sm overflow-auto">
        <table className="table table-bordered text-center align-middle">
          <thead>
            <tr>
              <th style={{ minWidth: "200px" }}>Employee</th>
              {daysArray.map((day) => (
                <th key={day}>{day}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length > 0 ? (
              attendanceData.map((emp) => (
                <tr key={emp._id}>
                  <td className="text-start">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-user-circle fs-4 text-secondary"></i>
                      <div>
                        <div>{emp.name}</div>
                        <div className="small text-muted">
                          {emp.designation || "Intern"}
                        </div>
                      </div>
                    </div>
                  </td>
                  {daysArray.map((day) => (
                    <td key={day}>{getStatusForDay(emp, day)}</td>
                  ))}
                  <td>
                    {getTotalPresent(emp)} / {daysArray.length}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={daysArray.length + 2}
                  className="text-center text-muted"
                >
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
