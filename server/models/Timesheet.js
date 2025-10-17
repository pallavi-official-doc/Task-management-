const mongoose = require("mongoose");

const TimesheetSchema = new mongoose.Schema(
  {
    // 👤 Employee / User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📝 Related Task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // ⏱ Start & End Time
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },

    // ⏳ Duration in seconds
    duration: {
      type: Number,
      default: 0, // total worked time (excludes breaks)
    },

    // ⏸ Total break time in seconds
    break: {
      type: Number,
      default: 0, // total paused time
    },

    // ⏸ Array of pause sessions (optional, for detailed logs)
    pauseLogs: [
      {
        start: { type: Date },
        end: { type: Date },
      },
    ],

    // 📝 Optional manual notes
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// 🔄 Auto-calc duration before save (if endTime is set)
TimesheetSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const totalSeconds = Math.floor((this.endTime - this.startTime) / 1000);
    const breakSeconds = this.break || 0;
    this.duration = Math.max(totalSeconds - breakSeconds, 0);
  }
  next();
});

module.exports = mongoose.model("Timesheet", TimesheetSchema);
