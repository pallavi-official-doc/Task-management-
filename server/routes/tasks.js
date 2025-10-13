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
  startTimer, // ⏱ Start task timer
  pauseTimer, // ⏸ Pause task timer
  resetTimer, // 🔄 Reset task timer
} = require("../controllers/tasks");

const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/adminMiddleware");

// ✅ Protect all routes below
router.use(protect);

// 📊 ✅ User Task Summary
router.get("/summary", getTaskSummary);

// 👑 ✅ Admin-only routes (must come BEFORE dynamic :id)
router.get("/all-tasks", admin, getAllTasksForAdmin);
router.get("/summary/admin", admin, getTaskSummaryForAdmin);

// ⏱ ✅ Task Timer routes
router.put("/:id/start", startTimer); // Start timer for task
router.put("/:id/pause", pauseTimer); // Pause timer for task
router.put("/:id/reset", resetTimer); // Reset timer for task

// 📝 ✅ Normal CRUD Routes
router
  .route("/")
  .get(getTasks) // Get all tasks for logged-in user (with filters, search)
  .post(createTask); // Create new task

router
  .route("/:id")
  .get(getTask) // Get single task details (for popup/details view)
  .put(updateTask) // Update task (edit)
  .delete(deleteTask); // Delete task

module.exports = router;
