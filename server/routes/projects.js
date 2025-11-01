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

// ✅ Get project members (for ticket assignment)
router.get("/:id/members", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate({
      path: "members.userId",
      select: "name email role",
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Send formatted list
    const members = project.members
      .filter((m) => m.userId)
      .map((m) => ({
        userId: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        role: m.userId.role,
      }));

    res.json(members);
  } catch (err) {
    console.error("FETCH PROJECT MEMBERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
