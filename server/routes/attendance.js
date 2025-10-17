const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAttendance, // ✅ GET today's record
  clockIn, // ✅ POST clock in
  clockOut, // ✅ POST clock out
  getMonthlyAttendanceSummary, // ✅ GET monthly records (for table)
} = require("../controllers/attendanceController");

router.use(protect);

// 📅 Get today's attendance (Dashboard)
router.get("/today", getAttendance);

// 🟢 Clock In
router.post("/", clockIn);

// 🔴 Clock Out
router.post("/clockout", clockOut);

// 📊 Monthly summary (React Attendance page)
router.get("/", getMonthlyAttendanceSummary);

module.exports = router;
