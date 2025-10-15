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

    // ⏳ Duration in seconds (easier to handle)
    duration: {
      type: Number,
      default: 0, // store in SECONDS instead of ms
    },

    // 🏷 Notes or manual log info (optional, good for manual entries)
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
    this.duration = Math.floor((this.endTime - this.startTime) / 1000); // in seconds
  }
  next();
});

module.exports = mongoose.model("Timesheet", TimesheetSchema);
