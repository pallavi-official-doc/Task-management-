const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/users");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// 🧠 Fetch all users (for project members dropdown)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}, "name email"); // only return name & email
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/team", protect, async (req, res) => {
  try {
    const team = await User.find({ createdBy: req.user.id }).select(
      "name email"
    );
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Failed to load team users" });
  }
});

// ✏️ Update user profile
router.put("/profile", protect, updateProfile);

module.exports = router;
