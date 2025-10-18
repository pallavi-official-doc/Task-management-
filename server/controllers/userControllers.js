// const User = require("../models/User");
// const bcrypt = require("bcryptjs");

// // @desc    Update user profile
// // @route   PUT /api/users/profile
// // @access  Private
// exports.updateProfile = async (req, res) => {
//   const { name, password } = req.body;

//   try {
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (name) user.name = name;

//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }

//     await user.save();

//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       message: "Profile updated successfully",
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 📌 GET /users/team
// // 👑 Admin can see all non-admin users (team)
// exports.getTeamUsers = async (req, res) => {
//   try {
//     // Fetch all users except admins
//     const users = await User.find({ role: { $ne: "admin" } }).select(
//       "_id name email role"
//     ); // return only essential fields

//     res.json(users);
//   } catch (err) {
//     console.error("❌ Error fetching team users:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* -------------------------------------------------------------------------- */
/* 🧩 Update Profile (Self or Admin)                                          */
/* -------------------------------------------------------------------------- */
// @route   PUT /api/users/:id?  (if admin) or /api/users/profile (if user)
// @access  Private (User or Admin)
exports.updateProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.user.id; // admin can pass :id, user uses own id
    const {
      name,
      email,
      password,
      mobile,
      country,
      gender,
      maritalStatus,
      designation,
      employeeCode,
    } = req.body;

    // 🧠 Role check — normal users can update only themselves
    if (req.user.role !== "admin" && targetId !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    let user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Update fields
    if (name) user.name = name;
    if (email && req.user.role === "admin") user.email = email; // only admin can change email
    if (mobile) user.mobile = mobile;
    if (country) user.country = country;
    if (gender) user.gender = gender;
    if (maritalStatus) user.maritalStatus = maritalStatus;
    if (designation) user.designation = designation;
    if (employeeCode) user.employeeCode = employeeCode;

    // ✅ Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      designation: user.designation,
      employeeCode: user.employeeCode,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Get Own Profile                                                         */
/* -------------------------------------------------------------------------- */
// @route   GET /api/users/profile
// @access  Private (User)
exports.getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Get Any User (Admin Only)                                               */
/* -------------------------------------------------------------------------- */
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Delete User (Self or Admin)                                             */
/* -------------------------------------------------------------------------- */
// @route   DELETE /api/users/:id
// @access  Private (Admin or Self)
exports.deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (req.user.role !== "admin" && targetId !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Get All Users (Admin Only)                                              */
/* -------------------------------------------------------------------------- */
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching all users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 🧩 Get Team Users (Admin Only, excludes Admins)                            */
/* -------------------------------------------------------------------------- */
// @route   GET /api/users/team
// @access  Private/Admin
exports.getTeamUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id name email role"
    );

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching team users:", err);
    res.status(500).json({ message: "Server error" });
  }
};
