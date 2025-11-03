const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Event name
    color: { type: String, default: "#0d6efd" }, // Label color
    location: { type: String }, // Where
    description: { type: String }, // Notes

    // Dates & times (store separately to match your form)
    startDate: { type: String, required: true }, // e.g. "2025-11-01"
    startTime: { type: String, required: true }, // e.g. "03:00 PM"
    endDate: { type: String, required: true },
    endTime: { type: String, required: true },

    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Select Employee (multi)

    // Host + optional client
    host: { type: String, enum: ["admin", "client"], default: "admin" },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Upcoming", "Completed", "Cancelled"],
      default: "Pending",
    },

    eventLink: { type: String }, // URL
    filePath: { type: String }, // uploaded file path

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
