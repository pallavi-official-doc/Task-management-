const moment = require("moment");
const User = require("../models/User");
const Leave = require("../models/Leave"); // Optional — if you have
const WorkFromHome = require("../models/WFH"); // Optional — if you have

// ✅ Get upcoming birthdays (within next 14 days)
exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const today = moment();
    const endDate = moment().add(14, "days");

    // 🎯 Find users with birthday between today and next 14 days
    const users = await User.find({
      birthday: { $ne: null },
    }).select("name birthday");

    const upcoming = users.filter((u) => {
      const bdayThisYear = moment(u.birthday).year(today.year());
      return bdayThisYear.isBetween(today, endDate, "day", "[]");
    });

    // Sort by upcoming date
    upcoming.sort(
      (a, b) => moment(a.birthday).date() - moment(b.birthday).date()
    );

    res.json(upcoming);
  } catch (err) {
    console.error("Error fetching birthdays:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get recent employee appreciations
exports.getAppreciations = async (req, res) => {
  try {
    // Assuming 'appreciations' are stored on User documents
    // OR you can create a separate Appreciation model if needed.
    const users = await User.find({ "appreciations.0": { $exists: true } })
      .select("name appreciations")
      .lean();

    let data = [];
    users.forEach((user) => {
      user.appreciations.forEach((a) => {
        data.push({
          _id: a._id,
          user: { _id: user._id, name: user.name },
          title: a.title,
          date: a.date,
        });
      });
    });

    // Sort by date (latest first)
    data.sort((a, b) => moment(b.date).diff(moment(a.date)));

    // Return last 5 appreciations
    res.json(data.slice(0, 5));
  } catch (err) {
    console.error("Error fetching appreciations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get employees on leave today
exports.getOnLeaveToday = async (req, res) => {
  try {
    const today = moment().startOf("day");

    // If you have a Leave model with `startDate`, `endDate`, `user`
    const leaves = await Leave.find({
      startDate: { $lte: today.toDate() },
      endDate: { $gte: today.toDate() },
    }).populate("user", "name");

    const data = leaves.map((l) => ({
      _id: l._id,
      name: l.user.name,
      type: l.type,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching on-leave list:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get employees working from home today
exports.getWFHToday = async (req, res) => {
  try {
    const today = moment().startOf("day");

    // If you have a WFH model with `date` and `user`
    const wfhRecords = await WorkFromHome.find({
      date: today.toDate(),
    }).populate("user", "name");

    const data = wfhRecords.map((w) => ({
      _id: w._id,
      name: w.user.name,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error fetching WFH list:", err);
    res.status(500).json({ message: "Server error" });
  }
};
