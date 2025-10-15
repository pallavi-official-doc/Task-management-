const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");

// ✅ Helper: Clean & convert array or string to ObjectId array
const cleanObjectIdArray = (input) => {
  if (!input) return [];
  let arr = input;
  if (typeof input === "string" && input.trim() !== "") {
    arr = [input];
  }
  if (Array.isArray(arr)) {
    return arr
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
  }
  return [];
};

// ✅ Helper: Clean single ObjectId (e.g. for client)
const cleanObjectId = (id) => {
  if (!id || id === "" || id === null) return null;
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null;
};

// ✅ Create Project
// ✅ Create Project (Admin only)
// ✅ Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    const { name, description, members, client, startDate, deadline } =
      req.body;

    // Clean members list
    const memberIds = cleanObjectIdArray(members);
    let memberDetails = [];

    if (memberIds.length > 0) {
      const selectedMembers = await User.find({
        _id: { $in: memberIds },
      }).select("name email");
      memberDetails = selectedMembers.map((m) => ({
        userId: m._id,
        name: m.name,
        email: m.email,
      }));
    }

    const project = await Project.create({
      name,
      description,
      client: cleanObjectId(client),
      members: memberDetails,
      startDate, // 👈 added
      deadline,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("❌ Create project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  ✅ Get all projects (Admin see all, Employees see only assigned)
exports.getProjects = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let filter = {};

    if (req.user.role !== "admin") {
      filter = { $or: [{ createdBy: userId }, { members: userId }] };
    }
    const projects = await Project.find(filter)
      .populate("members", "name email") // ✅ must be here
      .sort({ createdAt: -1 });

    const response = projects.map((p) => ({
      ...p.toObject(),
      status: p.computedStatus, // ✅ dynamic status
    }));

    res.json(response);
  } catch (err) {
    console.error("❌ Get projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Project Summary (User)
// ✅ Get Project Summary (for Dashboard)
exports.getProjectSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // 👑 Admin sees all projects
    // 👤 Employees: createdBy OR member of the project
    const base =
      req.user.role === "admin"
        ? {}
        : { $or: [{ createdBy: userId }, { "members.userId": userId }] };

    // 🟢 Active projects: Planned / Active / On Hold + not overdue
    const active = await Project.countDocuments({
      ...base,
      status: { $in: ["Planned", "Active", "On Hold"] },
      $or: [{ deadline: { $exists: false } }, { deadline: { $gte: now } }],
    });

    // 🔴 Overdue projects: not completed or cancelled & deadline in past
    const overdue = await Project.countDocuments({
      ...base,
      status: { $nin: ["Completed", "Cancelled"] },
      deadline: { $lt: now },
    });

    res.json({ active, overdue });
  } catch (err) {
    console.error("❌ Project summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Project summary (Admin)
// ✅ Project summary (Admin - Dashboard format)
exports.getProjectSummaryForAdmin = async (req, res) => {
  try {
    const now = new Date();

    // 🟢 Active projects for admin: Planned, Active, On Hold + not overdue
    const active = await Project.countDocuments({
      status: { $in: ["Planned", "Active", "On Hold"] },
      $or: [{ deadline: { $exists: false } }, { deadline: { $gte: now } }],
    });

    // 🔴 Overdue projects for admin: not completed/cancelled + deadline in past
    const overdue = await Project.countDocuments({
      status: { $nin: ["Completed", "Cancelled"] },
      deadline: { $lt: now },
    });

    res.json({ active, overdue });
  } catch (err) {
    console.error("❌ Admin project summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Project
exports.updateProject = async (req, res) => {
  try {
    const { members, ...otherData } = req.body;
    const memberIds = cleanObjectIdArray(members);

    let memberDetails = [];
    if (memberIds.length > 0) {
      const selectedMembers = await User.find({
        _id: { $in: memberIds },
      }).select("name email");
      memberDetails = selectedMembers.map((m) => ({
        userId: m._id,
        name: m.name,
        email: m.email,
      }));
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { ...otherData, members: memberDetails },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Project not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Update project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Delete project error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
