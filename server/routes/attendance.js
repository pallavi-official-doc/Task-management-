const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAttendance, // ✅ GET today's record
  clockIn, // ✅ POST clock in
  clockOut, // ✅ POST clock out
  getMonthlyAttendanceSummary,
  getAttendanceStatus, // ✅ GET monthly records (for table)
} = require("../controllers/attendanceController");

router.use(protect);

// 📅 Get today's attendance (Dashboard)
router.get("/today", getAttendance);

// 🟢 Clock In ✅ FIXED PATH
router.post("/clock-in", clockIn);

// 🔴 Clock Out ✅ FIXED PATH
router.post("/clock-out", clockOut);
// ✅ Get current day's attendance status (new endpoint)
router.get("/status", getAttendanceStatus);

// 📊 Monthly summary (React Attendance page)
router.get("/", getMonthlyAttendanceSummary);

module.exports = router;
