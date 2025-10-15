const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { admin } = require("../middleware/adminMiddleware");

const Project = require("../models/Project"); // ✅ Added missing import

const {
  createProject,
  getProjects,
  getProjectSummary,
  getProjectSummaryForAdmin,
  updateProject,
  deleteProject,
} = require("../controllers/projects");

// ✅ Protect all routes
router.use(protect);

/* ===============================
   📊 PROJECT DASHBOARD ROUTES
   =============================== */

// 📊 Project summaries
// Used by dashboard for counts (Active / Overdue)
router.get("/summary", getProjectSummary);
router.get("/summary/admin", admin, getProjectSummaryForAdmin);

// ✅ GET /api/projects/counters  → for the current user
router.get("/counters", async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Admin sees all projects; employees only assigned or created
    const base =
      req.user.role === "admin"
        ? {}
        : { $or: [{ createdBy: userId }, { "members.userId": userId }] };

    const active = await Project.countDocuments({
      ...base,
      status: { $in: ["Planned", "Active", "On Hold"] },
      $or: [{ deadline: { $exists: false } }, { deadline: { $gte: now } }],
    });

    const overdue = await Project.countDocuments({
      ...base,
      status: { $nin: ["Completed", "Cancelled"] },
      deadline: { $lt: now },
    });

    res.json({ active, overdue });
  } catch (e) {
    console.error("PROJECT COUNTERS ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   📝 CRUD ROUTES
   =============================== */

// 🆕 Create a new project (Admin only)
router.post("/", authorize("admin"), createProject);

// 📄 Get all projects for logged-in user (Admin → all, Employee → only assigned)
router.get("/", getProjects);

// ✏️ Update a project (Admin only)
router.put("/:id", authorize("admin"), updateProject);

// 🗑 Delete a project (Admin only)
router.delete("/:id", authorize("admin"), deleteProject);

module.exports = router;
