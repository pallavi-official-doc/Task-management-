// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: false, // ✅ added to support team hierarchy
//     },

//     // ✅ 👇 New fields for Dashboard features

//     birthday: {
//       type: Date,
//     },

//     designation: {
//       type: String,
//       default: "Intern",
//     },

//     employeeCode: {
//       type: String,
//       unique: true,
//       sparse: true, // allows some users to not have a code
//     },

//     appreciations: [
//       {
//         title: { type: String, required: true },
//         date: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------------------------------- */
    /* 👤 Basic Account Info                                                  */
    /* ---------------------------------------------------------------------- */
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
      required: false, // used for team hierarchy
    },

    /* ---------------------------------------------------------------------- */
    /* 🧩 Profile Settings Fields                                             */
    /* ---------------------------------------------------------------------- */
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Ms"],
      default: "Mr",
    },

    mobile: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    maritalStatus: {
      type: String,
      enum: ["Single", "Married"],
    },

    dob: {
      type: Date,
    },

    anniversary: {
      type: Date,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    googleCalendar: {
      type: Boolean,
      default: false,
    },

    /* ---------------------------------------------------------------------- */
    /* 🧩 Extra Fields for Dashboard / HR Features                            */
    /* ---------------------------------------------------------------------- */
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
      sparse: true,
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
