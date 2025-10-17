const Timesheet = require("../models/Timesheet");
const Task = require("../models/Task");

/**
 * ▶ START or RESUME TIMER (by Task ID)
 * POST /api/timesheets/start/:id
 */
exports.startTimer = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    let activeTimesheet = await Timesheet.findOne({
      task: taskId,
      user: req.user.id,
      endTime: null,
    });

    // If timer is not already running
    if (!task.running) {
      task.running = true;
      task.lastStartedAt = new Date();
      await task.save();

      if (!activeTimesheet) {
        activeTimesheet = await Timesheet.create({
          user: req.user.id,
          task: taskId,
          startTime: new Date(),
        });
      }
    }

    res.json({ task, timesheet: activeTimesheet });
  } catch (err) {
    console.error("❌ Error starting timer:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ⏸ Pause Timer (by Timesheet ID)
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
    timesheet.pauseLogs.push({ start: now });
    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error("❌ pauseTimer error:", err);
    res.status(500).json({ message: "Failed to pause timer" });
  }
};

/**
 * ⏸ Pause Timer (by Task ID)
 * PUT /api/timesheets/pause-by-task/:taskId
 */
exports.pauseByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const timesheet = await Timesheet.findOne({
      task: taskId,
      user: req.user.id,
      endTime: null,
    });

    if (!timesheet) {
      return res.status(404).json({ message: "No active timesheet found" });
    }

    const now = new Date();
    timesheet.pauseLogs.push({ start: now });
    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error("❌ pauseByTaskId error:", err);
    res.status(500).json({ message: "Failed to pause by task" });
  }
};

/**
 * ▶️ Resume Timer (by Timesheet ID)
 * PUT /api/timesheets/resume/:id
 */
exports.resumeTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheet = await Timesheet.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const now = new Date();
    const lastPause = timesheet.pauseLogs[timesheet.pauseLogs.length - 1];
    if (lastPause && !lastPause.end) {
      lastPause.end = now;
      const breakSeconds = Math.floor((now - lastPause.start) / 1000);
      timesheet.break += breakSeconds;
      await timesheet.save();
    }

    res.json(timesheet);
  } catch (err) {
    console.error("❌ resumeTimer error:", err);
    res.status(500).json({ message: "Failed to resume timer" });
  }
};

/**
 * ⏹ Stop Timer (by Timesheet ID)
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

    const task = await Task.findById(timesheet.task);
    if (task) {
      task.totalSeconds = Math.floor(timesheet.duration);
      task.running = false;
      task.lastStartedAt = null;
      await task.save();
    }

    res.json({ timesheet, task });
  } catch (err) {
    console.error("❌ stopTimer error:", err);
    res.status(500).json({ message: "Failed to stop timer" });
  }
};

/**
 * ⏹ Stop Timer (by Task ID)
 * PUT /api/timesheets/stop-by-task/:taskId
 */
exports.stopByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const timesheet = await Timesheet.findOne({
      task: taskId,
      user: req.user.id,
      endTime: null,
    });

    if (!timesheet) {
      return res.status(404).json({ message: "No active timesheet found" });
    }

    const now = new Date();
    const elapsed = (now - timesheet.startTime) / 1000;
    timesheet.duration = (timesheet.duration || 0) + elapsed;
    timesheet.endTime = now;
    await timesheet.save();

    const task = await Task.findById(taskId);
    if (task) {
      task.totalSeconds = Math.floor(timesheet.duration);
      task.running = false;
      task.lastStartedAt = null;
      await task.save();
    }

    res.json({ timesheet, task });
  } catch (err) {
    console.error("❌ stopByTaskId error:", err);
    res.status(500).json({ message: "Failed to stop timesheet by task" });
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
/**
 * 📅 Get My Timesheets (or all for Admin)
 * GET /api/timesheets
 */
exports.getMyTimesheets = async (req, res) => {
  try {
    const { user, start, end } = req.query;

    const query = {};

    // 👤 Non-admin → only own entries
    if (req.user.role !== "admin") {
      query.user = req.user.id;
    }
    // 👑 Admin → can filter by user
    else if (user && user !== "all") {
      query.user = user;
    }

    // 📅 Date range filter (FIXED)
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999); // ✅ include entire end day

      query.startTime = {
        $gte: startDate,
        $lte: endDate,
      };
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

    const monday = new Date(now);
    const day = monday.getDay();
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

    const perDay = Array(7)
      .fill(null)
      .map(() => ({
        durationSeconds: 0,
        breakSeconds: 0,
      }));

    sheets.forEach((t) => {
      const end = t.endTime ? t.endTime : new Date();
      const durationSeconds = Math.floor((end - t.startTime) / 1000);
      const d = new Date(t.startTime);
      const idx = (d.getDay() + 6) % 7;

      perDay[idx].durationSeconds += durationSeconds;
      if (t.break) perDay[idx].breakSeconds += t.break * 60;
    });

    const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const weeklySummary = days.map((dayLabel, i) => {
      const durationMinutes = Math.floor(perDay[i].durationSeconds / 60);
      const breakMinutes = Math.floor(perDay[i].breakSeconds / 60);
      const hours = (durationMinutes / 60).toFixed(1);

      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      return {
        day: dayLabel,
        duration: durationMinutes,
        break: breakMinutes,
        hours: Number(hours),
        active: now.toDateString() === dayDate.toDateString(),
      };
    });

    const weekTotalMinutes =
      perDay.reduce((acc, cur) => acc + cur.durationSeconds, 0) / 60;

    res.json({
      weekTotal: Number((weekTotalMinutes / 60).toFixed(1)),
      weeklySummary,
    });
  } catch (err) {
    console.error("❌ getWeeklySummary error:", err);
    res.status(500).json({ message: "Failed to get weekly summary" });
  }
};
// 📅 Weekly Timesheet Controllers
// 🟡 make sure you create this model
