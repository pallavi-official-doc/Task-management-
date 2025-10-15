const express = require("express");
const router = express.Router();
const { updateProfile, getTeamUsers } = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");
const User = require("../models/User");

// 👤 Fetch all users (optional: could be admin-only)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}, "name email"); // only return name & email
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 👥 Get team users created by the logged-in admin (used in Project Members dropdown)
router.get("/team", protect, authorize("admin"), getTeamUsers);

// ✏️ Update user profile
router.put("/profile", protect, updateProfile);

module.exports = router;
