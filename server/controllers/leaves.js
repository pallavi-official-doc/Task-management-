const Leave = require("../models/Leave");

/**
 * 📌 Get all leaves for logged-in user (with filters)
 */
exports.getMyLeaves = async (req, res) => {
  try {
    const { startDate, endDate, search, status } = req.query;
    const filter = { user: req.user.id };

    // 📅 Date range filter
    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // 🔍 Search by type / status / reason
    if (search) {
      filter.$or = [
        { type: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    // 📝 Filter by status (optional)
    if (status) {
      filter.status = status;
    }

    const leaves = await Leave.find(filter)
      .populate("user", "name email role")
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching user leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 👑 Admin: Get all leaves (with filters)
 */
exports.getAllLeavesForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { startDate, endDate, search, status, user } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [
        { type: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (user) filter.user = user;

    const leaves = await Leave.find(filter)
      .populate("user", "name email role")
      .populate("approvedBy", "name email role")
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching admin leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📝 Apply for a new leave
 */
exports.createLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, duration, reason } = req.body;
    const filePath = req.file ? `/uploads/leaves/${req.file.filename}` : null;

    const leave = new Leave({
      user: req.user.id,
      type,
      startDate,
      endDate,
      duration,
      reason,
      file: filePath,
      status: "Pending",
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    console.error("❌ Error creating leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 👑 Update leave status (Approve / Reject)
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    const { status, paid, adminComment } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        status,
        paid,
        adminComment: adminComment || "",
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    )
      .populate("user", "name email")
      .populate("approvedBy", "name email");

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.json(leave);
  } catch (err) {
    console.error("❌ Error updating leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🧍 Cancel leave (by user if pending)
 */
exports.cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findOneAndUpdate(
      { _id: id, user: req.user.id, status: "Pending" },
      { status: "Cancelled" },
      { new: true }
    );

    if (!leave) {
      return res
        .status(404)
        .json({ message: "Leave not found or cannot be cancelled" });
    }

    res.json(leave);
  } catch (err) {
    console.error("❌ Error cancelling leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🗑️ Delete leave (user or admin)
 */
exports.deleteLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await leave.deleteOne();
    res.json({ message: "Leave deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Update leave (admin or user)
// @route   PUT /leaves/:id
// @access  Private
exports.updateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const updateData = {
      type: req.body.type,
      duration: req.body.duration,
      startDate: req.body.startDate,
      endDate: req.body.endDate || null,
      reason: req.body.reason,
    };

    // Optional: Validate fields
    if (!updateData.type || !updateData.startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const leave = await Leave.findByIdAndUpdate(leaveId, updateData, {
      new: true,
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.status(200).json({ message: "Leave updated successfully", leave });
  } catch (error) {
    console.error("❌ Error updating leave:", error);
    res.status(500).json({ message: "Failed to update leave" });
  }
};
