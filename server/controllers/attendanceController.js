const Attendance = require("../models/Attendance");
const moment = require("moment");

exports.clockIn = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const existing = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Already clocked in today" });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      clockIn: new Date(),
      date: today,
    });

    res.json(attendance);
  } catch (err) {
    console.error("Clock In Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const record = await Attendance.findOne({ user: req.user.id, date: today });

    if (!record || !record.clockIn) {
      return res.status(400).json({ message: "You haven't clocked in yet" });
    }

    if (record.clockOut) {
      return res.status(400).json({ message: "Already clocked out today" });
    }

    const now = new Date();
    const totalWorked = now - record.clockIn;

    record.clockOut = now;
    record.totalWorked = totalWorked;
    await record.save();

    res.json(record);
  } catch (err) {
    console.error("Clock Out Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const record = await Attendance.findOne({ user: req.user.id, date: today });
    res.json(record);
  } catch (err) {
    console.error("Attendance Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
