const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },

    requesterType: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    status: {
      type: String,
      enum: ["Open", "Pending", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    files: [{ type: String }],
  },
  { timestamps: true }
);

// Auto Increment Ticket ID
ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    const last = await mongoose
      .model("Ticket")
      .findOne()
      .sort({ createdAt: -1 });

    let nextNumber = last?.ticketId
      ? Number(last.ticketId.split("-")[1]) + 1
      : 1;

    this.ticketId = `TKT-${String(nextNumber).padStart(3, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
