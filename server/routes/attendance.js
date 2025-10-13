const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  clockIn,
  clockOut,
  getTodayStatus,
} = require("../controllers/attendanceController");

// Clock In / Clock Out
router.post("/clockin", protect, clockIn);
router.post("/clockout", protect, clockOut);
router.get("/status", protect, getTodayStatus);

module.exports = router;
