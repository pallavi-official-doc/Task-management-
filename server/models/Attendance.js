const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📅 The specific work date
    date: {
      type: Date,
      required: true,
    },

    // 🕒 Clock in time
    clockIn: {
      type: Date,
      default: null,
    },

    // 🕓 Clock out time
    clockOut: {
      type: Date,
      default: null,
    },

    // ⏱️ Total duration (in minutes)
    totalDuration: {
      type: Number,
      default: 0,
    },

    // 📌 Attendance status
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

// 🚀 Ensure a user has only one attendance per date
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
