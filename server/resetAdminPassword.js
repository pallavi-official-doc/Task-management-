const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // adjust path if needed

dotenv.config();

// Replace with the admin email and new password you want
const ADMIN_EMAIL = "admin@example.com";
const NEW_PASSWORD = "Admin123";

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const user = await User.findOne({ email: ADMIN_EMAIL });

    if (!user) {
      console.log("Admin user not found!");
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(NEW_PASSWORD, salt);
    await user.save();

    console.log(
      `Password reset successful! You can now login as: ${ADMIN_EMAIL} / ${NEW_PASSWORD}`
    );
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetPassword();
