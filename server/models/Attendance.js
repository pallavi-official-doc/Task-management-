const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📅 One record per day
    date: {
      type: Date,
      required: true,
    },

    // 🕓 Clock In time
    clockIn: {
      type: Date,
      default: null,
    },

    // 🕔 Clock Out time
    clockOut: {
      type: Date,
      default: null,
    },

    // 📌 Status (you can keep this for reporting)
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Half Day",
        "Late",
        "Holiday",
        "Day Off",
        "On Leave",
      ],
      default: "Absent",
    },
  },
  { timestamps: true }
);

// 🧠 Ensure unique record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
