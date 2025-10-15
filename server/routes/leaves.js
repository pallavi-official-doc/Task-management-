const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  getMyLeaves,
  getAllLeavesForAdmin,
  createLeave,
  updateLeaveStatus,
  cancelLeave,
  deleteLeave,
} = require("../controllers/leaves");

// 🔐 All routes require authentication
router.use(protect);

/**
 * 🧍 USER ROUTES
 * ---------------------------------------
 */

// 📋 Get user's own leaves
router.get("/", getMyLeaves);

// ➕ Apply for a new leave (with optional file upload)
router.post("/", upload.single("file"), createLeave);

// ❌ Cancel a pending leave (user only)
router.put("/cancel/:id", cancelLeave);

// 🗑 Delete own leave (if pending or allowed)
router.delete("/:id", deleteLeave);

/**
 * 👑 ADMIN ROUTES
 * ---------------------------------------
 */

// 📋 Get all leaves (with filters)
router.get("/admin", authorize("admin"), getAllLeavesForAdmin);

// ✏️ Approve / Reject a leave
router.put("/admin/status/:id", authorize("admin"), updateLeaveStatus);

module.exports = router;
