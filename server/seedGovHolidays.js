// seedGovHolidays.js
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const Holiday = require("./models/Holiday");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_app";

async function seed(year = 2025) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const apiURL = `https://date.nager.at/api/v3/PublicHolidays/${year}/IN`;
    const res = await fetch(apiURL);
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from Nager API");
    }

    // Map to your Holiday model format
    const holidays = data.map((h) => ({
      name: h.localName || h.name,
      date: h.date,
      type: "government",
      description: h.name,
      isRecurring: false,
    }));

    // Optional: Clear existing government holidays for that year to avoid duplicates
    await Holiday.deleteMany({
      type: "government",
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    // Insert new holidays
    await Holiday.insertMany(holidays);
    console.log(
      `✅ Inserted ${holidays.length} government holidays for ${year}`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding government holidays:", err);
    process.exit(1);
  }
}

seed(2025);
