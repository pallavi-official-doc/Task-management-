// const mongoose = require("mongoose");

// const TaskSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       default: "", // optional, give default empty string
//     },
//     status: {
//       type: String,
//       enum: ["pending", "completed"],
//       default: "pending",
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Task", TaskSchema);
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    // 📝 Basic info
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // 📌 Task status
    status: {
      type: String,
      enum: ["pending", "doing", "completed", "overdue"],
      default: "pending",
    },

    // ⚡ Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // 🗓️ Dates
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // ⏱️ Time tracking fields (for start/pause/stop timer)
    totalSeconds: {
      type: Number,
      default: 0, // accumulated time in seconds
    },
    running: {
      type: Boolean,
      default: false, // whether timer is currently active
    },
    lastStartedAt: {
      type: Date,
      default: null, // when the current timer started
    },

    // 🔗 Project association
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    // 👤 Assigned user
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ✍️ Creator of the task
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
