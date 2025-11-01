const mongoose = require("mongoose");

const ticketCommentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: { type: String, default: "" },
    file: { type: String, default: "" }, // file path
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketComment", ticketCommentSchema);
