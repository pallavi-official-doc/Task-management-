const Attendance = require("../models/Attendance");
const moment = require("moment");

// 📌 Get attendance for user (by month & year)
exports.getAttendance = async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? req.query.userId : req.user.id;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const startDate = moment({ year, month: month - 1, day: 1 }).startOf("day");
    const endDate = moment(startDate).endOf("month");

    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    });

    res.json(attendanceRecords);
  } catch (err) {
    console.error("❌ Error fetching attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📝 Mark or update attendance for a day
exports.markAttendance = async (req, res) => {
  try {
    const { date, status } = req.body;
    const userId = req.user.id;

    if (!date || !status) {
      return res.status(400).json({ message: "Date and status required" });
    }

    const existing = await Attendance.findOne({ user: userId, date });

    let record;
    if (existing) {
      existing.status = status;
      record = await existing.save();
    } else {
      record = await Attendance.create({ user: userId, date, status });
    }

    res.json(record);
  } catch (err) {
    console.error("❌ Error marking attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};
