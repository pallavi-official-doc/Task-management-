const mongoose = require("mongoose");

const appreciationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
    },
    awardName: {
      type: String,
      required: true,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appreciation", appreciationSchema);
