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
  updateLeave,
} = require("../controllers/leaves");

// 🔐 All routes require authentication
router.use(protect);

// 👑 ADMIN ROUTES
router.get("/admin", authorize("admin"), getAllLeavesForAdmin);
router.put("/admin/status/:id", authorize("admin"), updateLeaveStatus);

/**
 * 🧍 USER ROUTES
 */
router.get("/", getMyLeaves);
router.post("/", upload.single("file"), createLeave);
router.put("/cancel/:id", cancelLeave);
router.delete("/:id", deleteLeave);
// ✅ Add this route for updating a leave
router.put("/:id", authorize("admin"), updateLeave);

module.exports = router;
