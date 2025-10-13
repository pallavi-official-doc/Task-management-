const mongoose = require("mongoose");

const TimesheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timesheet", TimesheetSchema);
