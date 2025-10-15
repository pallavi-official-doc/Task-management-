const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📝 Type of leave
    type: {
      type: String,
      enum: ["Sick", "Casual", "Earned", "Maternity", "Paternity", "Unpaid"],
      required: true,
    },

    // 📅 Dates
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },

    // ⏱ Duration of leave
    duration: {
      type: String,
      enum: ["Full Day", "Multiple", "First Half", "Second Half"],
      default: "Full Day",
    },

    // 📊 Total number of days (calculated automatically)
    totalDays: {
      type: Number,
      default: 1,
    },

    // 📝 Reason provided by employee
    reason: {
      type: String,
      required: true,
    },

    // 📝 Optional supporting document (e.g., medical)
    file: {
      type: String, // file path or URL
    },

    // 📌 Status & Admin Handling
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    adminComment: {
      type: String, // Reason for rejection or notes
    },

    // 🪙 Paid or unpaid leave
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧠 Pre-save hook to calculate totalDays
LeaveSchema.pre("save", function (next) {
  if (!this.endDate) {
    this.endDate = this.startDate;
  }

  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  // Ignore time components
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Calculate total days difference
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Handle half-day logic
  if (this.duration === "First Half" || this.duration === "Second Half") {
    this.totalDays = 0.5;
  } else {
    this.totalDays = diff;
  }

  next();
});

module.exports = mongoose.model("Leave", LeaveSchema);
