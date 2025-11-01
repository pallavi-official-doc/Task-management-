// const express = require("express");
// const router = express.Router();
// const { register, login, getMe } = require("../controllers/auth");
// const { protect } = require("../middleware/auth");

// router.post("/register", register);
// router.post("/login", login);
// router.get("/me", protect, getMe);

// module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { register, login, getMe } = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const { logout } = require("../controllers/auth");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (public)
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user info
 * @access  Private
 */
router.get("/me", protect, getMe);
/**
 * @route GET /api/auth/users
 * @desc  Get all users for chat dropdown
 * @access Private
 */
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load users" });
  }
});
router.post("/logout", protect, logout);

module.exports = router;
