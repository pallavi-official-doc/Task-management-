const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getOwnProfile,
  getUserById,
  deleteUser,
  getAllUsers,
  getTeamUsers,
} = require("../controllers/userControllers");
const { protect, authorize } = require("../middleware/auth");

// 🧩 Protect all routes
router.use(protect);

/* -------------------------------------------------------------------------- */
/* 👤 User Routes (for self)                                                  */
/* -------------------------------------------------------------------------- */

// Get logged-in user's own profile
// GET /api/users/profile
router.get("/profile", getOwnProfile);

// Update logged-in user's own profile
// PUT /api/users/profile
router.put("/profile", updateProfile);

/* -------------------------------------------------------------------------- */
/* 👑 Admin Routes                                                            */
/* -------------------------------------------------------------------------- */

// Get all users (Admin only)
router.get("/", authorize("admin"), getAllUsers);

// Get non-admin team users (Admin only)
router.get("/team", authorize("admin"), getTeamUsers);

// Get any user by ID (Admin only)
router.get("/:id", authorize("admin"), getUserById);

// Update any user by ID (Admin only)
router.put("/:id", authorize("admin"), updateProfile);

// Delete any user (Admin only)
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
