// // controllers/tasks.js
// const Task = require("../models/Task");

// // Get tasks for logged-in user
// exports.getTasks = async (req, res) => {
//   try {
//     // Only return tasks for this user and populate user info
//     const tasks = await Task.find({ user: req.user.id }).populate("user");
//     res.json(tasks);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };
// // Create a task
// exports.createTask = async (req, res) => {
//   const { title, description } = req.body;
//   try {
//     const task = new Task({
//       title,
//       description,
//       status: "pending",
//       user: req.user.id, // associate task with logged-in user
//     });
//     await task.save();
//     res.status(201).json(task);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// };

// // Get single task
// exports.getTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ msg: "Task not found" });
//     res.status(200).json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update task
// exports.updateTask = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true } // return updated task
//     );
//     if (!task) return res.status(404).json({ msg: "Task not found" });
//     res.status(200).json(task);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete task
// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(req.params.id);
//     if (!task) return res.status(404).json({ msg: "Task not found" });
//     res.status(200).json({ msg: "Task deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Admin: get all tasks
// exports.getAllTasksForAdmin = async (req, res) => {
//   try {
//     const tasks = await Task.find().populate("user", "name email");
//     res.json(tasks);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// };
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Timesheet = require("../models/Timesheet");

/**
 * 📌 Get tasks for logged-in user (with filters, search, date range & limit)
 * Supports:
 *  - ?status=pending
 *  - ?overdue=true
 *  - ?startDate=2025-01-01&endDate=2025-01-31
 *  - ?search=keyword
 *  - ?limit=5   ← For dashboard recent tasks
 */
exports.getTasks = async (req, res) => {
  try {
    const { status, overdue, startDate, endDate, search, limit } = req.query;
    const filter = { user: req.user.id };

    // ✅ Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // ✅ Overdue filter
    if (overdue === "true") {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: "completed" };
    }

    // ✅ Date range filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // ✅ Text search (title + description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🧠 Build query
    let query = Task.find(filter)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code")
      .sort({ updatedAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const tasks = await query;

    // 🕒 Update timers in response (no DB save)
    const updatedTasks = tasks.map((task) => {
      let totalSeconds = task.totalSeconds;
      if (task.running && task.lastStartedAt) {
        const now = new Date();
        const diff = Math.floor((now - task.lastStartedAt) / 1000);
        totalSeconds += diff;
      }
      return { ...task.toObject(), totalSeconds };
    });

    res.json(updatedTasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📝 Create Task + Auto create Timesheet entry
 */
exports.createTask = async (req, res) => {
  try {
    let { title, description, priority, dueDate, project, assignedTo } =
      req.body;

    // 🧼 Sanitize ObjectIds
    if (!project) project = null;
    else if (typeof project === "string")
      project = new mongoose.Types.ObjectId(project);

    if (!assignedTo) assignedTo = null;
    else if (typeof assignedTo === "string")
      assignedTo = new mongoose.Types.ObjectId(assignedTo);

    // 📝 Create Task
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo,
      user: req.user.id,
    });

    // ⏱ Auto-create Timesheet entry for this task
    await Timesheet.create({
      user: req.user.id,
      task: task._id,
      startTime: new Date(),
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📌 Get single task details
 */
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code");

    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("❌ Error fetching task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✏️ Update Task (with objectId sanitization)
 */
exports.updateTask = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.project === "" || !data.project) data.project = null;
    else if (typeof data.project === "string")
      data.project = new mongoose.Types.ObjectId(data.project);

    if (data.assignedTo === "" || !data.assignedTo) data.assignedTo = null;
    else if (typeof data.assignedTo === "string")
      data.assignedTo = new mongoose.Types.ObjectId(data.assignedTo);

    const updated = await Task.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!updated) return res.status(404).json({ msg: "Task not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🗑️ Delete Task
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ⏱ Start Task Timer
 */
exports.startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (!task.running) {
      task.running = true;
      task.lastStartedAt = new Date();
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error("❌ Error starting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ⏸ Pause Task Timer
 */
exports.pauseTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.running) {
      const now = new Date();
      const diff = Math.floor((now - task.lastStartedAt) / 1000);
      task.totalSeconds += diff;
      task.running = false;
      task.lastStartedAt = null;
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error("❌ Error pausing timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔄 Reset Timer
 */
exports.resetTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    task.totalSeconds = 0;
    task.running = false;
    task.lastStartedAt = null;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("❌ Error resetting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 👑 Admin: Get all tasks
 */
exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching all tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📊 Task Summary for logged-in user
 */
exports.getTaskSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [pending, doing, completed, overdue] = await Promise.all([
      Task.countDocuments({ user: userId, status: "pending" }),
      Task.countDocuments({ user: userId, status: "doing" }),
      Task.countDocuments({ user: userId, status: "completed" }),
      Task.countDocuments({
        user: userId,
        dueDate: { $lt: new Date() },
        status: { $ne: "completed" },
      }),
    ]);

    res.json({ pending, doing, completed, overdue });
  } catch (err) {
    console.error("❌ Error getting task summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 👑 Admin Task Summary
 */
exports.getTaskSummaryForAdmin = async (req, res) => {
  try {
    const [pending, doing, completed, overdue] = await Promise.all([
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "doing" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({
        dueDate: { $lt: new Date() },
        status: { $ne: "completed" },
      }),
    ]);

    res.json({ pending, doing, completed, overdue });
  } catch (err) {
    console.error("❌ Error getting admin task summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📝 Get distinct statuses for user
 */
exports.getTaskStatuses = async (req, res) => {
  try {
    const statuses = await Task.distinct("status", { user: req.user.id });
    res.json(statuses);
  } catch (err) {
    console.error("❌ Error getting task statuses:", err);
    res.status(500).json({ message: "Server error" });
  }
};
