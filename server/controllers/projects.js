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
exports.createProject = async (req, res) => {
  try {
    let {
      code,
      name,
      description,
      client,
      status,
      progress,
      startDate,
      deadline,
      members,
    } = req.body;

    const memberIds = cleanObjectIdArray(members);
    const clientId = cleanObjectId(client);

    // ✅ Validate members belong to creator’s team
    let validMemberIds = [];
    if (memberIds.length > 0) {
      const validMembers = await User.find({
        _id: { $in: memberIds },
        createdBy: req.user.id,
      }).select("_id");
      validMemberIds = validMembers.map((u) => u._id);
    }

    const project = await Project.create({
      code,
      name,
      description,
      client: clientId,
      status,
      progress: progress || 0,
      startDate,
      deadline,
      members: validMemberIds,
      createdBy: req.user.id,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("❌ Create project error:", err);
    res.status(500).json({ message: "Failed to create project" });
  }
};

// ✅ Get all projects for logged-in user
exports.getProjects = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate("members", "name email")
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("❌ Get projects error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Project Summary (User)
exports.getProjectSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [planned, active, onHold, completed, cancelled] = await Promise.all([
      Project.countDocuments({ members: userId, status: "Planned" }),
      Project.countDocuments({ members: userId, status: "Active" }),
      Project.countDocuments({ members: userId, status: "On Hold" }),
      Project.countDocuments({ members: userId, status: "Completed" }),
      Project.countDocuments({ members: userId, status: "Cancelled" }),
    ]);

    res.json({ planned, active, onHold, completed, cancelled });
  } catch (err) {
    console.error("❌ Project summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Project summary (Admin)
exports.getProjectSummaryForAdmin = async (req, res) => {
  try {
    const [planned, active, onHold, completed, cancelled] = await Promise.all([
      Project.countDocuments({ status: "Planned" }),
      Project.countDocuments({ status: "Active" }),
      Project.countDocuments({ status: "On Hold" }),
      Project.countDocuments({ status: "Completed" }),
      Project.countDocuments({ status: "Cancelled" }),
    ]);

    res.json({ planned, active, onHold, completed, cancelled });
  } catch (err) {
    console.error("❌ Admin project summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Project
exports.updateProject = async (req, res) => {
  try {
    const { members, client, ...otherData } = req.body;

    const memberIds = cleanObjectIdArray(members);
    const clientId = cleanObjectId(client);

    let validMemberIds = [];
    if (memberIds.length > 0) {
      const validMembers = await User.find({
        _id: { $in: memberIds },
        createdBy: req.user.id,
      }).select("_id");
      validMemberIds = validMembers.map((u) => u._id);
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { ...otherData, members: validMemberIds, client: clientId },
      { new: true }
    )
      .populate("members", "name email")
      .populate("client", "name email");

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
