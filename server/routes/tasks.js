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
} = require("../controllers/tasks");

const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/adminMiddleware");

// ✅ Protect all routes below
router.use(protect);

/* ===============================
   📊 DASHBOARD & SUMMARY ROUTES
   =============================== */

// User Task Summary
router.get("/summary", getTaskSummary);

// Admin Task Summary
router.get("/summary/admin", admin, getTaskSummaryForAdmin);

// Admin: All tasks
router.get("/all-tasks", admin, getAllTasksForAdmin);

// Task statuses (should be before :id)
router.get("/statuses", getTaskStatuses);

/* ===============================
   📅 TODAY'S TASKS & COUNTERS
   =============================== */

// ✅ GET /api/tasks/today → fetch today's tasks for logged-in user
router.get("/today", async (req, res) => {
  try {
    const userId = req.user._id;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      assignedTo: userId, // or createdBy if your schema uses that
      dueDate: { $gte: start, $lte: end },
    })
      .select("title status dueDate createdAt")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (e) {
    console.error("TODAY TASKS ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/tasks/counters?scope=today|all
router.get("/counters", async (req, res) => {
  try {
    const userId = req.user._id;
    const scope = (req.query.scope || "today").toLowerCase();

    let dateFilter = {};
    if (scope === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      dateFilter = { dueDate: { $gte: start, $lte: end } };
    }

    const pending = await Task.countDocuments({
      assignedTo: userId,
      status: { $nin: ["Completed"] },
      ...dateFilter,
    });

    const now = new Date();
    const overdue = await Task.countDocuments({
      assignedTo: userId,
      status: { $nin: ["Completed"] },
      dueDate: { $lt: now },
    });

    res.json({ pending, overdue });
  } catch (e) {
    console.error("TASK COUNTERS ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   ⏱ TIMER ROUTES
   =============================== */

router.put("/:id/start", startTimer);
router.put("/:id/pause", pauseTimer);
router.put("/:id/reset", resetTimer);

/* ===============================
   📝 CRUD ROUTES
   =============================== */

router.route("/").get(getTasks).post(createTask);

router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
