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

    // ✅ Modified Filter: Include both created and assigned tasks
    const filter =
      req.user.role === "admin"
        ? {} // Admin can see all tasks
        : {
            $or: [
              { user: req.user.id }, // Tasks created by the user
              { assignedTo: req.user.id }, // Tasks assigned to the user
            ],
          };

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
        ...(filter.$or || []), // preserve previous $or (user/assignedTo)
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

    if (!project) project = null;
    else if (typeof project === "string")
      project = new mongoose.Types.ObjectId(project);

    if (!assignedTo) assignedTo = null;
    else if (typeof assignedTo === "string")
      assignedTo = new mongoose.Types.ObjectId(assignedTo);

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo,
      user: req.user.id,
    });

    // ⛔ No timesheet created here

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

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) return res.status(404).json({ msg: "Task not found" });

    // ✅ Preserve fields that are not sent in the request
    if (data.assignedTo === undefined || data.assignedTo === null)
      data.assignedTo = existingTask.assignedTo;

    if (data.project === undefined || data.project === null)
      data.project = existingTask.project;

    if (data.priority === undefined || data.priority === null)
      data.priority = existingTask.priority;

    // 🧠 Update the task safely
    const updated = await Task.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
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

      // ✅ Move task from pending to doing if needed
      if (task.status === "pending") {
        task.status = "doing";
      }

      await task.save();
    }

    res.json(task.toObject());
  } catch (err) {
    console.error("❌ Error starting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ⏸ Pause Task Timer
 */
/**
 * ⏸ Pause Task Timer
 * PUT /api/tasks/:id/pause
 */
exports.pauseTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.running) {
      // Calculate elapsed seconds since lastStartedAt
      const now = new Date();
      if (task.lastStartedAt) {
        const elapsed = Math.floor((now - task.lastStartedAt) / 1000);
        task.totalSeconds = (task.totalSeconds || 0) + elapsed;
      }

      // Pause timer
      task.running = false;
      task.lastStartedAt = null;

      await task.save();
    }

    res.json(task.toObject());
  } catch (err) {
    console.error("❌ Error pausing timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔄 Reset Timer
 */
/**
 * ⏹ Reset Task Timer
 * PUT /api/tasks/:id/reset
 */
exports.resetTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    task.totalSeconds = 0;
    task.running = false;
    task.lastStartedAt = null;

    // Optional: Reset status to pending when timer is reset
    if (task.status !== "completed") {
      task.status = "pending";
    }

    await task.save();

    res.json(task.toObject());
  } catch (err) {
    console.error("❌ Error resetting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ⏱ Log total time spent on a task (called from frontend when timer is paused or stopped)
 * PUT /api/tasks/:id/log-time
 */

exports.logTime = async (req, res) => {
  try {
    const { timeSpent } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // ✅ 1. Update Task totalSeconds
    task.totalSeconds = timeSpent;
    task.running = false;
    task.lastStartedAt = null;
    await task.save();

    // ✅ 2. Find the ACTIVE timesheet for this task
    const timesheet = await Timesheet.findOne({
      task: taskId,
      endTime: null,
    }).sort({ startTime: -1 });

    if (timesheet) {
      const end = new Date();
      timesheet.endTime = end;
      timesheet.totalSeconds = timeSpent; // save duration in seconds if you store it
      await timesheet.save();
    }

    res.json({ task, timesheet });
  } catch (err) {
    console.error("❌ Error logging time:", err);
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
    // ✅ Define userId properly from authenticated user
    const userId = req.user._id; // comes from your auth middleware (protect)

    // ✅ Build user filter
    const userFilter = { $or: [{ user: userId }, { assignedTo: userId }] };

    // ✅ Count tasks by status
    const [pending, doing, completed, overdue] = await Promise.all([
      Task.countDocuments({ ...userFilter, status: "pending" }),
      Task.countDocuments({ ...userFilter, status: "doing" }),
      Task.countDocuments({ ...userFilter, status: "completed" }),
      Task.countDocuments({
        ...userFilter,
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

/**
 * 📅 Get Today's Tasks (with optional ?status=doing|pending|all)
 * GET /api/tasks/today?status=doing
 */
exports.getTodayTasks = async (req, res) => {
  try {
    const statusQuery = (req.query.status || "doing").toLowerCase();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 👇 Status filter logic
    let statusFilter = {};
    if (statusQuery === "all") {
      statusFilter = { status: { $in: ["doing", "pending"] } };
    } else {
      statusFilter = { status: statusQuery };
    }

    const tasks = await Task.find({
      user: req.user.id,
      ...statusFilter,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("project", "name code")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching today's tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};
