const express = require("express");
const router = express.Router();
const Holiday = require("../models/Holiday");
const { protect, authorize } = require("../middleware/auth");
const moment = require("moment");

// ✅ GET: All Holidays (Company + Optional)
router.get("/", protect, async (req, res) => {
  try {
    const { year, search } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    // Base query: within year range
    const query = {
      date: { $gte: startOfYear, $lte: endOfYear },
      type: { $ne: "government" }, // exclude gov (handled separately)
    };

    // Optional: search by name
    if (search && search.trim() !== "") {
      query.name = { $regex: search, $options: "i" };
    }

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    console.error("❌ Error fetching holidays:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟩 GET: Government Holidays for a Year
router.get("/gov/:year", protect, async (req, res) => {
  try {
    const { year } = req.params;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const govHolidays = await Holiday.find({
      type: "government",
      date: { $gte: startOfYear, $lte: endOfYear },
    }).sort({ date: 1 });

    res.json(govHolidays);
  } catch (err) {
    console.error("❌ Error fetching government holidays:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 📝 POST: Add New Holiday (Admin only)
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, date, type, description, isRecurring, isOptional, location } =
      req.body;

    const existing = await Holiday.findOne({ date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Holiday already exists for this date" });
    }

    const holiday = new Holiday({
      name,
      date,
      type,
      description,
      isRecurring,
      isOptional,
      location,
      createdBy: req.user._id,
    });

    const saved = await holiday.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error adding holiday:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✏️ PUT: Update Holiday (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const updated = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating holiday:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑 DELETE: Delete Holiday (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const deleted = await Holiday.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting holiday:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🟤 POST: Generate Weekly Offs for a Year (Admin only)
router.post(
  "/generate-weekly-offs",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { year } = req.body;
      if (!year) return res.status(400).json({ message: "Year is required" });

      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);

      const weeklyOffs = [];
      let current = new Date(start);
      while (current <= end) {
        if (current.getDay() === 0) {
          weeklyOffs.push({
            name: "Weekly Off",
            date: new Date(current),
            type: "weekly_off",
          });
        }
        current.setDate(current.getDate() + 1);
      }

      // Optional: avoid duplicates using insertMany with ordered:false
      await Holiday.insertMany(weeklyOffs, { ordered: false });

      res.json({ message: "Weekly offs generated successfully" });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ message: "Weekly offs already exist" });
      }
      console.error("❌ Error generating weekly offs:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
