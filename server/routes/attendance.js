const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getAttendance,
  markAttendance,
} = require("../controllers/attendanceController");

router.get("/", protect, getAttendance);
router.post("/", protect, markAttendance);

module.exports = router;
