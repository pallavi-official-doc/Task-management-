const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    client: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Planned", "Active", "On Hold", "Completed", "Cancelled"],
      default: "Planned",
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false, // ⬅️ THIS causes the error if no member is selected
        },
        name: String,
        email: String,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// 🧠 Virtual to compute status dynamically
projectSchema.virtual("computedStatus").get(function () {
  const now = new Date();

  if (this.status === "Completed") return "Completed";
  if (this.status === "Cancelled") return "Cancelled";
  if (this.status === "On Hold") return "On Hold";

  if (this.startDate && now < this.startDate) {
    return "Planned";
  }

  if (this.deadline && now > this.deadline) {
    return "Overdue"; // 🚨 Past deadline but not completed
  }

  return "Active";
});

module.exports = mongoose.model("Project", projectSchema);
