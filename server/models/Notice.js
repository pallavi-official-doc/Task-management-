const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    notice: { type: String, required: true },
    date: { type: Date, default: Date.now },
    to: { type: String, required: true }, // e.g. "All Employees" or "Project A Team"
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);
