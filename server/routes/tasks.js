const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getAllTasksForAdmin,
  getTaskSummary,
  getTaskSummaryForAdmin,
  startTimer,
  pauseTimer,
  resetTimer,
  getTaskStatuses,
  getTodayTasks,
  logTime,
} = require("../controllers/tasks");

const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/adminMiddleware");

// ✅ Protect all routes below
router.use(protect);

/* ===============================
   📊 DASHBOARD & SUMMARY ROUTES
   =============================== */

router.get("/summary", getTaskSummary);
router.get("/summary/admin", admin, getTaskSummaryForAdmin);
router.get("/all-tasks", admin, getAllTasksForAdmin);
router.get("/statuses", getTaskStatuses);

/* ===============================
   📅 TODAY'S TASKS
   =============================== */

// 📅 Get Today's "Doing" Tasks (Dashboard)
router.get("/today", getTodayTasks); // ✅ Only ONE route, above /:id

/* ===============================
   ⏱ TIMER ROUTES
   =============================== */

router.put("/:id/start", startTimer);
router.put("/:id/pause", pauseTimer);
router.put("/:id/reset", resetTimer);
router.put("/:id/log-time", protect, logTime);

/* ===============================
   📝 CRUD ROUTES
   =============================== */

router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
