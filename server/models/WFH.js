const mongoose = require("mongoose");

const wfhSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkFromHome", wfhSchema);
