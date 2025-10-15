const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  startTimer,
  pauseTimer,
  stopTimer,
  getMyTimesheets,
  getAllTimesheetsForAdmin,
  getActiveTimer, // ✅ New
  getWeeklySummary, // ✅ New
} = require("../controllers/timesheetController");

// ✅ All routes require authentication
router.use(protect);

/**
 * @route   POST /api/timesheets/start
 * @desc    Start or resume a timer for a task
 */
router.post("/start", startTimer);

/**
 * @route   PUT /api/timesheets/pause/:id
 * @desc    Pause timer (don't delete timesheet entry)
 */
router.put("/pause/:id", pauseTimer);

/**
 * @route   PUT /api/timesheets/stop/:id
 * @desc    Stop timer and finalize duration
 */
router.put("/stop/:id", stopTimer);

/**
 * @route   GET /api/timesheets/active
 * @desc    Get currently running timesheet (for floating timer)
 */
router.get("/active", getActiveTimer);

/**
 * @route   GET /api/timesheets/weekly-summary
 * @desc    Get weekly summary of time logged for dashboard
 */
router.get("/weekly-summary", getWeeklySummary);

/**
 * @route   GET /api/timesheets
 * @desc    Get all timesheets for logged-in user
 */
router.get("/", getMyTimesheets);

/**
 * @route   GET /api/timesheets/admin
 * @desc    (Optional) Get all timesheets for Admin dashboard
 */
router.get("/admin", getAllTimesheetsForAdmin);

module.exports = router;
