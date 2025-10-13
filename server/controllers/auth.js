const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new user (either public signup OR created by an admin/user)
// @route   POST /api/auth/register
// @access  Public or Private (if admin creates a team member)
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // 🧠 Determine who created this user
    let createdBy = null;
    if (req.user && req.user.id) {
      createdBy = req.user.id; // If a logged-in admin creates the user
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "user", // Default role is 'user'
      createdBy,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdBy: user.createdBy,
          },
        });
      }
    );
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Login user and return JWT
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdBy: user.createdBy,
          },
        });
      }
    );
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).send("Server error");
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("❌ GetMe error:", err.message);
    res.status(500).send("Server error");
  }
};
