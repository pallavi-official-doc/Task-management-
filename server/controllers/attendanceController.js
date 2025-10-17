const Attendance = require("../models/Attendance");
const Holiday = require("../models/Holiday"); // optional if you use holidays
const moment = require("moment");

/**
 * 📌 Get today's attendance for logged-in user
 * GET /api/attendance/today
 */
exports.getAttendance = async (req, res) => {
  try {
    const today = moment().startOf("day").toDate();

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: today,
    });

    res.json(attendance || null);
  } catch (err) {
    console.error("❌ getAttendance error:", err);
    res.status(500).json({ message: "Failed to get attendance" });
  }
};

/**
 * 🟢 Clock In
 * POST /api/attendance
 */
exports.clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day").toDate();
    const now = new Date();

    let attendance = await Attendance.findOne({ user: userId, date: today });

    // Check for holiday
    const isHoliday = await Holiday.findOne({ date: today });
    if (isHoliday) {
      return res.status(400).json({ message: "Cannot clock in on a holiday" });
    }

    if (!attendance) {
      // 🧠 Decide status based on clock-in time
      let status = "Present";
      const hour = moment(now).hour();
      if (hour >= 10 && hour < 13) status = "Late";
      else if (hour >= 13) status = "Half Day";

      attendance = await Attendance.create({
        user: userId,
        date: today,
        clockIn: now,
        status,
      });

      return res.json({
        message: "Clocked in successfully",
        attendance,
      });
    }

    // If already clocked in
    if (attendance.clockIn && !attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked in" });
    }

    // Re-clock in after clocking out (optional)
    attendance.clockIn = now;
    attendance.clockOut = null;
    await attendance.save();

    res.json({
      message: "Re-clocked in successfully",
      attendance,
    });
  } catch (err) {
    console.error("❌ clockIn error:", err);
    res.status(500).json({ message: "Failed to clock in" });
  }
};

/**
 * 🔴 Clock Out
 * POST /api/attendance/clockout
 */
exports.clockOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day").toDate();

    const attendance = await Attendance.findOne({ user: userId, date: today });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "No attendance found to clock out" });
    }

    if (attendance.clockOut) {
      return res.status(400).json({ message: "Already clocked out" });
    }

    attendance.clockOut = new Date();
    await attendance.save();

    res.json({
      message: "Clocked out successfully",
      attendance,
    });
  } catch (err) {
    console.error("❌ clockOut error:", err);
    res.status(500).json({ message: "Failed to clock out" });
  }
};
/**
 * 📊 Monthly Attendance Summary (For Attendance Table)
 * GET /api/attendance?month=MM&year=YYYY
 */
exports.getMonthlyAttendanceSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const start = moment({ year, month: month - 1 })
      .startOf("month")
      .toDate();
    const end = moment({ year, month: month - 1 })
      .endOf("month")
      .toDate();

    // Fetch all attendance records for this month
    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate("user", "name designation")
      .sort({ date: 1 });

    // ✅ Group by user
    const grouped = {};
    records.forEach((rec) => {
      const uid = rec.user._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          _id: uid,
          name: rec.user.name,
          designation: rec.user.designation || "Employee",
          attendance: [],
        };
      }

      grouped[uid].attendance.push({
        date: rec.date,
        status: rec.status,
      });
    });

    // ✅ OPTIONAL: auto-mark Sundays as "Holiday"
    const daysInMonth = moment({ year, month: month - 1 }).daysInMonth();
    Object.values(grouped).forEach((emp) => {
      const existingDates = emp.attendance.map((a) =>
        moment(a.date).format("YYYY-MM-DD")
      );

      for (let d = 1; d <= daysInMonth; d++) {
        const date = moment({ year, month: month - 1, day: d }).toDate();
        const dateStr = moment(date).format("YYYY-MM-DD");

        // If Sunday and no record exists, push Holiday
        if (
          moment(date).day() === 0 && // Sunday
          !existingDates.includes(dateStr)
        ) {
          emp.attendance.push({
            date,
            status: "Holiday",
          });
        }
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("❌ getMonthlyAttendanceSummary error:", err);
    res.status(500).json({ message: "Failed to fetch monthly attendance" });
  }
};
