// const Timesheet = require("../models/Timesheet");
// const Task = require("../models/Task");

// // ⏱ Start or Resume Timer
// exports.startTimer = async (req, res) => {
//   try {
//     const { taskId } = req.body;

//     // check if there's already a running timesheet for this task and user
//     let existing = await Timesheet.findOne({
//       user: req.user.id,
//       task: taskId,
//       endTime: null,
//     });

//     if (!existing) {
//       existing = new Timesheet({
//         user: req.user.id,
//         task: taskId,
//         startTime: new Date(),
//       });
//       await existing.save();
//     }

//     res.status(201).json(existing);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to start timer" });
//   }
// };

// // ⏸ Pause Timer
// exports.pauseTimer = async (req, res) => {
//   try {
//     const { id } = req.params; // timesheet id

//     const timesheet = await Timesheet.findById(id);
//     if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

//     timesheet.endTime = new Date();
//     timesheet.duration =
//       (timesheet.duration || 0) +
//       (timesheet.endTime.getTime() - timesheet.startTime.getTime()) / 1000;
//     await timesheet.save();

//     res.json(timesheet);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to pause timer" });
//   }
// };

// // ⏹ Stop Timer (same as pause but finalize)
// exports.stopTimer = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const timesheet = await Timesheet.findById(id);
//     if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

//     timesheet.endTime = new Date();
//     timesheet.duration =
//       (timesheet.duration || 0) +
//       (timesheet.endTime.getTime() - timesheet.startTime.getTime()) / 1000;
//     await timesheet.save();

//     res.json(timesheet);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to stop timer" });
//   }
// };

// // 📅 Get daily timesheets for logged-in user
// exports.getMyTimesheets = async (req, res) => {
//   try {
//     const query = { user: req.user.id };

//     if (req.query.date === "today") {
//       const startOfDay = new Date();
//       startOfDay.setHours(0, 0, 0, 0);
//       const endOfDay = new Date();
//       endOfDay.setHours(23, 59, 59, 999);

//       query.startTime = { $gte: startOfDay, $lte: endOfDay };
//     }

//     const entries = await Timesheet.find(query)
//       .populate("task")
//       .populate("user", "name role");

//     res.json(entries);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch timesheets" });
//   }
// };
const Timesheet = require("../models/Timesheet");
const Task = require("../models/Task");

/**
 * ⏱ Start or Resume Timer
 * POST /api/timesheets/start
 */
exports.startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;

    // Check if there's already a running timer for this user (any task)
    const active = await Timesheet.findOne({
      user: req.user.id,
      endTime: null,
    });

    if (active) {
      return res
        .status(400)
        .json({ message: "You already have an active timer." });
    }

    // Create new timesheet entry
    const newSheet = await Timesheet.create({
      user: req.user.id,
      task: taskId,
      startTime: new Date(),
    });

    res.status(201).json(newSheet);
  } catch (err) {
    console.error("❌ startTimer error:", err);
    res.status(500).json({ message: "Failed to start timer" });
  }
};

/**
 * ⏸ Pause Timer
 * PUT /api/timesheets/pause/:id
 */
exports.pauseTimer = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }
    if (timesheet.endTime) {
      return res.status(400).json({ message: "Timer is already stopped." });
    }

    const now = new Date();
    const elapsed = (now.getTime() - timesheet.startTime.getTime()) / 1000;
    timesheet.duration = (timesheet.duration || 0) + elapsed;
    timesheet.endTime = now;
    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error("❌ pauseTimer error:", err);
    res.status(500).json({ message: "Failed to pause timer" });
  }
};

/**
 * ⏹ Stop Timer
 * PUT /api/timesheets/stop/:id
 */
exports.stopTimer = async (req, res) => {
  try {
    const { id } = req.params;

    const timesheet = await Timesheet.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const now = new Date();
    if (!timesheet.endTime) {
      const elapsed = (now.getTime() - timesheet.startTime.getTime()) / 1000;
      timesheet.duration = (timesheet.duration || 0) + elapsed;
      timesheet.endTime = now;
    }

    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error("❌ stopTimer error:", err);
    res.status(500).json({ message: "Failed to stop timer" });
  }
};

/**
 * 🟢 GET Active Timer
 * GET /api/timesheets/active
 */
exports.getActiveTimer = async (req, res) => {
  try {
    const active = await Timesheet.findOne({
      user: req.user.id,
      endTime: null,
    }).populate("task", "title");

    if (!active) return res.json(null);

    const now = new Date();
    const elapsedSeconds = Math.floor((now - active.startTime) / 1000);

    res.json({
      _id: active._id,
      task: active.task,
      startTime: active.startTime,
      elapsedSeconds,
      isRunning: true,
    });
  } catch (err) {
    console.error("❌ getActiveTimer error:", err);
    res.status(500).json({ message: "Failed to get active timer" });
  }
};

/**
 * 📅 Get My Timesheets
 * GET /api/timesheets?date=today
 */
exports.getMyTimesheets = async (req, res) => {
  try {
    const query = { user: req.user.id };

    if (req.query.date === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const entries = await Timesheet.find(query)
      .populate("task", "title")
      .populate("user", "name role")
      .sort({ startTime: -1 });

    res.json(entries);
  } catch (err) {
    console.error("❌ getMyTimesheets error:", err);
    res.status(500).json({ message: "Failed to fetch timesheets" });
  }
};

/**
 * 📊 Admin: Get all users' timesheets (optional)
 */
exports.getAllTimesheetsForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const entries = await Timesheet.find()
      .populate("task", "title")
      .populate("user", "name email role")
      .sort({ startTime: -1 });

    res.json(entries);
  } catch (err) {
    console.error("❌ getAllTimesheetsForAdmin error:", err);
    res.status(500).json({ message: "Failed to fetch timesheets" });
  }
};

/**
 * 📊 Weekly Summary (Mon–Sun)
 * GET /api/timesheets/weekly-summary
 */
exports.getWeeklySummary = async (req, res) => {
  try {
    const now = new Date();

    // Find Monday of this week
    const monday = new Date(now);
    const day = monday.getDay(); // 0=Sun..6=Sat
    const diff = (day + 6) % 7;
    monday.setDate(monday.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 7);
    sunday.setHours(23, 59, 59, 999);

    const sheets = await Timesheet.find({
      user: req.user.id,
      startTime: { $gte: monday, $lte: sunday },
    });

    const perDay = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
    sheets.forEach((t) => {
      const end = t.endTime ? t.endTime : new Date();
      const dur = Math.floor((end - t.startTime) / 1000);
      const d = new Date(t.startTime);
      const idx = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
      perDay[idx] += dur;
    });

    const weekTotal = perDay.reduce((a, b) => a + b, 0);

    res.json({ perDay, weekTotal });
  } catch (err) {
    console.error("❌ getWeeklySummary error:", err);
    res.status(500).json({ message: "Failed to get weekly summary" });
  }
};
