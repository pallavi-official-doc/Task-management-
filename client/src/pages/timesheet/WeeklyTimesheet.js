import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaTrash } from "react-icons/fa";

/**
 * 🟡 WeeklyTimesheet Component
 * Displays a weekly breakdown of timesheet entries grouped by task and day.
 */
const WeeklyTimesheet = ({ entries = [] }) => {
  const [weekStart, setWeekStart] = useState(
    moment().startOf("week").add(1, "day")
  ); // Monday
  const [weekDays, setWeekDays] = useState([]);
  const [rows, setRows] = useState([]);

  // 📅 Calculate week days dynamically
  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = moment(weekStart).add(i, "days");
      days.push({
        date: d,
        dayLabel: d.format("ddd").toUpperCase(),
        dayNum: d.format("DD"),
      });
    }
    setWeekDays(days);
  }, [weekStart]);

  // 🧠 Group timesheet entries by task and day index (0 = Mon, 6 = Sun)
  const groupEntriesByWeek = (entries, weekStart) => {
    const weekRows = {};

    entries.forEach((entry) => {
      if (!entry.startTime) return;

      const entryDate = moment(entry.startTime);
      if (
        !entryDate.isBetween(
          moment(weekStart).startOf("day"),
          moment(weekStart).add(6, "days").endOf("day"),
          null,
          "[]"
        )
      ) {
        return; // skip entries not in this week
      }

      const taskName = entry.task?.title || "Untitled Task";
      const dayIndex = entryDate.diff(moment(weekStart).startOf("day"), "days");

      // ⏱ Duration in hours
      const start = moment(entry.startTime);
      const end = entry.endTime ? moment(entry.endTime) : moment();
      const durationHours = moment.duration(end.diff(start)).asHours();

      if (!weekRows[taskName]) {
        weekRows[taskName] = { task: taskName, hours: Array(7).fill(0) };
      }

      weekRows[taskName].hours[dayIndex] += durationHours;
    });

    return Object.values(weekRows);
  };

  // 📌 Group entries whenever week or data changes
  useEffect(() => {
    const grouped = groupEntriesByWeek(entries, weekStart);
    setRows(grouped);
  }, [entries, weekStart]);

  // ➕ Add new manual row
  const handleAddRow = () => {
    setRows([...rows, { task: "", hours: Array(7).fill(0) }]);
  };

  // 🗑 Delete row
  const handleDeleteRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // 🧠 Handle manual hour change
  const handleHourChange = (rowIndex, dayIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex].hours[dayIndex] = parseFloat(value) || 0;
    setRows(newRows);
  };

  return (
    <div className="card p-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Weekly Timesheet</h5>
        <div>
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={() => setWeekStart(moment(weekStart).subtract(7, "days"))}
          >
            ◀
          </button>
          <span className="fw-bold">
            {weekStart.format("DD MMM")} -{" "}
            {moment(weekStart).add(6, "days").format("DD MMM YYYY")}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm ms-2"
            onClick={() => setWeekStart(moment(weekStart).add(7, "days"))}
          >
            ▶
          </button>
        </div>
      </div>

      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th style={{ width: "200px" }}>Task</th>
            {weekDays.map((day) => (
              <th key={day.dayNum} className="text-center">
                <div>{day.dayNum}</div>
                <small className="text-muted">{day.dayLabel}</small>
              </th>
            ))}
            <th className="text-center">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => {
              const total = row.hours.reduce((a, b) => a + b, 0).toFixed(1);
              return (
                <tr key={rowIndex}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Task name"
                      value={row.task}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[rowIndex].task = e.target.value;
                        setRows(newRows);
                      }}
                    />
                  </td>
                  {row.hours.map((hour, dayIndex) => (
                    <td key={dayIndex} className="text-center">
                      <input
                        type="number"
                        className="form-control text-center"
                        style={{ width: "70px", margin: "0 auto" }}
                        value={hour.toFixed(1)}
                        min="0"
                        step="0.5"
                        onChange={(e) =>
                          handleHourChange(rowIndex, dayIndex, e.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td className="text-center fw-bold">{total}h</td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteRow(rowIndex)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={weekDays.length + 2}
                className="text-center text-muted"
              >
                No timesheet entries for this week
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-outline-primary" onClick={handleAddRow}>
          Add More
        </button>
      </div>
    </div>
  );
};

export default WeeklyTimesheet;
