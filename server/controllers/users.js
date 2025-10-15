const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 GET /users/team
// 👑 Admin can see all non-admin users (team)
exports.getTeamUsers = async (req, res) => {
  try {
    // Fetch all users except admins
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id name email role"
    ); // return only essential fields

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching team users:", err);
    res.status(500).json({ message: "Server error" });
  }
};
