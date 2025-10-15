const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Diwali"
    date: { type: Date, required: true }, // e.g., 2025-10-29

    type: {
      type: String,
      enum: ["company", "government"],
      default: "company",
    },

    description: { type: String },

    // ✅ Repeats every year (e.g., Independence Day)
    isRecurring: { type: Boolean, default: false },

    // ✅ Store MM-DD for recurring holidays (e.g., "08-15" for Aug 15)
    yearlyDay: { type: String },

    // ✅ Optional holiday (employee can choose to take or not)
    isOptional: { type: Boolean, default: false },

    // ✅ Useful if holidays differ by region or branch
    location: { type: String },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// 📅 Index on date to speed up upcoming holiday queries
HolidaySchema.index({ date: 1 });

module.exports = mongoose.model("Holiday", HolidaySchema);
