const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getAllTasksForAdmin, // make sure this is imported
} = require("../controllers/tasks");
const { protect } = require("../middleware/auth.js");
const { admin } = require("../middleware/adminMiddleware");

router.use(protect); // Protect all routes

// Admin-only route must come before /:id
router.get("/all-tasks", admin, getAllTasksForAdmin);

// Normal user routes
router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
