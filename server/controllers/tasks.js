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

// ✅ Get tasks for logged-in user (with filters, search, pagination)

exports.getTasks = async (req, res) => {
  try {
    const { status, overdue, startDate, endDate, search, limit } = req.query;
    const query = { user: req.user.id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (overdue === "true") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "completed" };
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    let taskQuery = Task.find(query)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code")
      .sort({ createdAt: -1 });

    if (limit) taskQuery = taskQuery.limit(parseInt(limit));

    const tasks = await taskQuery;

    // 🕒 Compute up-to-date timer
    const updatedTasks = tasks.map((task) => {
      let totalSeconds = task.totalSeconds;
      if (task.running && task.lastStartedAt) {
        const now = new Date();
        const diff = Math.floor((now - task.lastStartedAt) / 1000);
        totalSeconds += diff;
      }
      return {
        ...task.toObject(),
        totalSeconds,
      };
    });

    res.json(updatedTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Create task (with ObjectId sanitization)
exports.createTask = async (req, res) => {
  try {
    let { title, description, priority, dueDate, project, assignedTo } =
      req.body;

    // 🧼 Sanitize project field
    if (!project || project === "") {
      project = null;
    } else if (typeof project === "string") {
      project = new mongoose.Types.ObjectId(project);
    }

    // 🧼 Sanitize assignedTo field
    if (!assignedTo || assignedTo === "") {
      assignedTo = null;
    } else if (typeof assignedTo === "string") {
      assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo,
      user: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code");

    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update task (with ObjectId sanitization)
exports.updateTask = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // 🧼 Convert project
    if (updateData.project === "" || !updateData.project) {
      updateData.project = null;
    } else if (typeof updateData.project === "string") {
      updateData.project = new mongoose.Types.ObjectId(updateData.project);
    }

    // 🧼 Convert assignedTo
    if (updateData.assignedTo === "" || !updateData.assignedTo) {
      updateData.assignedTo = null;
    } else if (typeof updateData.assignedTo === "string") {
      updateData.assignedTo = new mongoose.Types.ObjectId(
        updateData.assignedTo
      );
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ msg: "Task not found" });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    res.status(200).json({ msg: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Start Timer
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
    console.error("Error starting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Pause Timer
exports.pauseTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.running) {
      const now = new Date();
      const secondsDiff = Math.floor((now - task.lastStartedAt) / 1000);
      task.totalSeconds += secondsDiff;
      task.running = false;
      task.lastStartedAt = null;
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error("Error pausing timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Timer
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
    console.error("Error resetting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: get all tasks
exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name code")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Get task summary for logged-in user
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

    res.json({
      pending,
      doing,
      completed,
      overdue,
    });
  } catch (err) {
    console.error("Error getting task summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Get task summary for all users
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

    res.json({
      pending,
      doing,
      completed,
      overdue,
    });
  } catch (err) {
    console.error("Error getting admin task summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};
