const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    totalWorked: {
      type: Number, // in milliseconds
      default: 0,
    },
    date: {
      type: String, // store in YYYY-MM-DD format for easy query
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
