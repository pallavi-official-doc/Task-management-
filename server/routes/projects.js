const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { admin } = require("../middleware/adminMiddleware");
const {
  createProject,
  getProjects,
  getProjectSummary,
  getProjectSummaryForAdmin,
  updateProject,
  deleteProject,
} = require("../controllers/projects");

router.use(protect);

// 🆕 Create a new project
router.post("/", createProject);

// 📄 Get all projects for logged-in user
router.get("/", getProjects);

// 📊 Project summaries
router.get("/summary", getProjectSummary);
router.get("/summary/admin", admin, getProjectSummaryForAdmin);

// ✏️ Update a project
router.put("/:id", updateProject);

// 🗑 Delete a project
router.delete("/:id", deleteProject);

module.exports = router;
