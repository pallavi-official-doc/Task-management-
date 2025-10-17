const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  startTimer,
  pauseTimer,
  pauseByTaskId,
  stopTimer,
  stopByTaskId,
  resumeTimer,
  getMyTimesheets,
  getAllTimesheetsForAdmin,
  getActiveTimer,
  getWeeklySummary,
} = require("../controllers/timesheetController");

router.use(protect);

router.post("/start/:id", startTimer);
router.put("/pause/:id", pauseTimer);
router.put("/pause-by-task/:taskId", pauseByTaskId);
router.put("/resume/:id", resumeTimer);
router.put("/stop/:id", stopTimer);
router.put("/stop-by-task/:taskId", stopByTaskId);
router.get("/active", getActiveTimer);
router.get("/weekly-summary", getWeeklySummary);
router.get("/", getMyTimesheets);
router.put("/pause-by-task/:taskId", pauseByTaskId);
router.put("/stop-by-task/:taskId", stopByTaskId);

router.get("/admin", getAllTimesheetsForAdmin);

module.exports = router;
