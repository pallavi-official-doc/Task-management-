const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    client: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Planned", "Active", "On Hold", "Completed", "Cancelled"],
      default: "Planned",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    deadline: {
      type: Date,
    },

    // 🧑‍🤝‍🧑 store member info (name, email) for easier rendering
    members: [
      {
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        _id: false,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
