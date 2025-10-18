const Appreciation = require("../models/Appreciation");

// 🧩 Utility: check if user is admin/hr
const isAdminOrHR = (user) =>
  user && (user.role === "admin" || user.role === "hr");

/* -------------------------------------------------------------------------- */
/* 🏆 Create New Award                                                        */
/* -------------------------------------------------------------------------- */
exports.createAppreciation = async (req, res) => {
  try {
    if (!isAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { employee, awardName, profession, date } = req.body;

    if (!employee || !awardName || !date) {
      return res
        .status(400)
        .json({ message: "Employee, Award Name, and Date are required" });
    }

    const award = await Appreciation.create({
      employee,
      awardName,
      profession,
      date,
      createdBy: req.user._id,
    });

    res.status(201).json(award);
  } catch (error) {
    console.error("❌ Error creating award:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 📋 Get All Awards (Admin/HR) or Employee’s Own Awards                      */
/* -------------------------------------------------------------------------- */
exports.getAppreciations = async (req, res) => {
  try {
    let filter = {};

    if (!isAdminOrHR(req.user)) {
      // If normal employee, show only their awards
      filter.employee = req.user._id;
    }

    const awards = await Appreciation.find(filter)
      .populate("employee", "name email")
      .populate("createdBy", "name role")
      .sort({ date: -1 });

    res.json(awards);
  } catch (error) {
    console.error("❌ Error fetching awards:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* ✏️ Update Award (Admin/HR only)                                            */
/* -------------------------------------------------------------------------- */
exports.updateAppreciation = async (req, res) => {
  try {
    if (!isAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const award = await Appreciation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!award) return res.status(404).json({ message: "Award not found" });

    res.json(award);
  } catch (error) {
    console.error("❌ Error updating award:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/* -------------------------------------------------------------------------- */
/* 🗑️ Delete Award (Admin/HR only)                                            */
/* -------------------------------------------------------------------------- */
exports.deleteAppreciation = async (req, res) => {
  try {
    if (!isAdminOrHR(req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const award = await Appreciation.findByIdAndDelete(req.params.id);

    if (!award) return res.status(404).json({ message: "Award not found" });

    res.json({ message: "Award deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting award:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
