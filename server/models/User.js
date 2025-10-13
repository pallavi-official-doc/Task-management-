const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ added to support team hierarchy
    },

    // ✅ 👇 New fields for Dashboard features

    birthday: {
      type: Date,
    },

    designation: {
      type: String,
      default: "Intern",
    },

    employeeCode: {
      type: String,
      unique: true,
      sparse: true, // allows some users to not have a code
    },

    appreciations: [
      {
        title: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
