const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Annual Leave"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
