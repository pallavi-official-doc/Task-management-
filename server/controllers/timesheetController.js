const Timesheet = require("../models/Timesheet");

// ⏱️ Start a timer for a task
exports.startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;

    const timesheet = new Timesheet({
      user: req.user.id,
      task: taskId,
      startTime: new Date(),
    });

    await timesheet.save();
    res.status(201).json(timesheet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start timer" });
  }
};

// ⏸️ Pause/Stop timer (update end time & duration)
exports.stopTimer = async (req, res) => {
  try {
    const { id } = req.params; // timesheet ID

    const timesheet = await Timesheet.findById(id);
    if (!timesheet)
      return res.status(404).json({ message: "Timesheet not found" });

    timesheet.endTime = new Date();
    timesheet.duration = timesheet.endTime - timesheet.startTime;
    await timesheet.save();

    res.json(timesheet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to stop timer" });
  }
};

// 📋 Get all timesheets for user
exports.getMyTimesheets = async (req, res) => {
  try {
    const entries = await Timesheet.find({ user: req.user.id }).populate(
      "task"
    );
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch timesheets" });
  }
};
