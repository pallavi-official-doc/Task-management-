// const mongoose = require("mongoose");

// const HolidaySchema = new mongoose.Schema(
//   {
//     // 📌 Title / Name of the holiday
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // 📅 Actual date of holiday
//     date: {
//       type: Date,
//       required: true,
//       unique: true, // one holiday per date
//     },

//     // 🏷 Type of holiday
//     type: {
//       type: String,
//       enum: ["company", "government", "weekly_off"],
//       default: "company",
//     },

//     // 🌈 Used in FullCalendar and attendance table for color coding
//     color: {
//       type: String,
//       default: "#3788d8", // default blue for company holiday
//     },

//     description: {
//       type: String,
//       trim: true,
//     },

//     // ✅ Repeats every year (e.g., Independence Day on Aug 15)
//     isRecurring: {
//       type: Boolean,
//       default: false,
//     },

//     // ✅ Store MM-DD for recurring holidays (e.g., "08-15")
//     yearlyDay: {
//       type: String,
//     },

//     // ✅ Optional holiday (e.g., employees can choose to take or not)
//     isOptional: {
//       type: Boolean,
//       default: false,
//     },

//     // 🌍 Region / branch-specific holiday (optional)
//     location: {
//       type: String,
//     },

//     // 👑 Admin who created this holiday
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// // 📅 Index on date for fast lookups
// HolidaySchema.index({ date: 1 });

// // 🧠 Pre-save hook to auto-assign color based on type
// HolidaySchema.pre("save", function (next) {
//   if (this.type === "government") {
//     this.color = "#dc3545"; // 🟥 red for government
//   } else if (this.type === "company") {
//     this.color = "#3788d8"; // 🟦 blue for company
//   } else if (this.type === "weekly_off") {
//     this.color = "#6c757d"; // 🟩 gray for weekly off
//   }
//   next();
// });

// module.exports = mongoose.model("Holiday", HolidaySchema);
// models/Holiday.js
const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ["government", "weekly"],
      default: "government",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
