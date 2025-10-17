// const Holiday = require("../models/Holiday");

// // 📌 GET: All holidays with optional filters (year, type, search, optional)
// exports.getHolidays = async (req, res) => {
//   try {
//     const { search, year, type, optional } = req.query;
//     const filter = {};

//     // 🔍 Search by name
//     if (search) {
//       filter.name = { $regex: search, $options: "i" };
//     }

//     // 📅 Filter by year
//     if (year) {
//       const start = new Date(`${year}-01-01`);
//       const end = new Date(`${year}-12-31`);
//       filter.date = { $gte: start, $lte: end };
//     }

//     // 🟩 Filter by type (company or government)
//     if (type) {
//       filter.type = type;
//     }

//     // 🟡 Filter optional holidays (true/false)
//     if (optional !== undefined) {
//       filter.isOptional = optional === "true";
//     }

//     const holidays = await Holiday.find(filter).sort({ date: 1 });
//     res.json(holidays);
//   } catch (err) {
//     console.error("❌ Error fetching holidays:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ➕ POST: Create a new holiday (Admin)
// exports.createHoliday = async (req, res) => {
//   try {
//     const { name, date, type, description, isRecurring, isOptional, location } =
//       req.body;

//     // 🧠 Auto-generate yearlyDay if recurring
//     let yearlyDay = null;
//     if (isRecurring && date) {
//       const d = new Date(date);
//       yearlyDay = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//         d.getDate()
//       ).padStart(2, "0")}`;
//     }

//     const holiday = await Holiday.create({
//       name,
//       date,
//       type: type || "company",
//       description: description || "",
//       isRecurring: isRecurring || false,
//       yearlyDay,
//       isOptional: isOptional || false,
//       location: location || null,
//       createdBy: req.user ? req.user._id : null,
//     });

//     res.status(201).json(holiday);
//   } catch (err) {
//     console.error("❌ Error creating holiday:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✏️ PUT: Update a holiday (Admin)
// exports.updateHoliday = async (req, res) => {
//   try {
//     const { name, date, type, description, isRecurring, isOptional, location } =
//       req.body;

//     const updateData = {
//       name,
//       date,
//       type,
//       description,
//       isRecurring,
//       isOptional,
//       location,
//     };

//     // 🧠 Recalculate yearlyDay if recurring or date changes
//     if (isRecurring && date) {
//       const d = new Date(date);
//       updateData.yearlyDay = `${String(d.getMonth() + 1).padStart(
//         2,
//         "0"
//       )}-${String(d.getDate()).padStart(2, "0")}`;
//     } else {
//       updateData.yearlyDay = null;
//     }

//     const updated = await Holiday.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "Holiday not found" });
//     }

//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating holiday:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 🗑️ DELETE: Remove a holiday (Admin)
// exports.deleteHoliday = async (req, res) => {
//   try {
//     const deleted = await Holiday.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Holiday not found" });
//     }

//     res.json({ message: "Holiday deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting holiday:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 📅 GET: Upcoming holidays (including recurring)
// exports.getUpcomingHolidays = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Future non-recurring holidays
//     const future = await Holiday.find({
//       isRecurring: false,
//       date: { $gte: today },
//     }).sort({ date: 1 });

//     // Recurring holidays (check yearlyDay)
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate()).padStart(2, "0");
//     const todayKey = `${mm}-${dd}`;

//     const recurring = await Holiday.find({ isRecurring: true });

//     const upcomingRecurring = recurring
//       .filter((h) => h.yearlyDay >= todayKey)
//       .sort((a, b) => (a.yearlyDay > b.yearlyDay ? 1 : -1));

//     const upcoming = [...future, ...upcomingRecurring].slice(0, 15);

//     res.json(upcoming);
//   } catch (err) {
//     console.error("❌ Error fetching upcoming holidays:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // 🟤 Auto-generate weekly offs (e.g. Sundays)
// exports.generateWeeklyOffs = async (req, res) => {
//   try {
//     // Example: Generate holidays for all Sundays in a year
//     const { year } = req.body;
//     if (!year) return res.status(400).json({ message: "Year is required" });

//     const start = new Date(year, 0, 1);
//     const end = new Date(year, 11, 31);
//     const holidays = [];

//     for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//       if (d.getDay() === 0) {
//         holidays.push({
//           name: "Weekly Off",
//           date: new Date(d),
//           type: "company",
//           description: "Auto-generated weekly off (Sunday)",
//         });
//       }
//     }

//     // Bulk insert
//     await require("../models/Holiday").insertMany(holidays);

//     res.json({
//       message: `Weekly offs generated for ${year}`,
//       count: holidays.length,
//     });
//   } catch (err) {
//     console.error("❌ generateWeeklyOffs error:", err);
//     res.status(500).json({ message: "Failed to generate weekly offs" });
//   }
// };
const moment = require("moment");
const Holiday = require("../models/Holiday");

// 📌 Get all holidays
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (err) {
    console.error("❌ Error fetching holidays:", err);
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
};

// 📌 Create holiday (Admin only)
exports.createHoliday = async (req, res) => {
  try {
    const { title, date, type } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and Date are required" });
    }

    const holiday = new Holiday({
      title,
      date: new Date(date),
      type: type || "government",
    });

    const saved = await holiday.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating holiday:", err);
    res.status(500).json({ message: "Failed to create holiday" });
  }
};

// 📌 Update holiday (Admin only)
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, type } = req.body;

    const updated = await Holiday.findByIdAndUpdate(
      id,
      {
        title,
        date: new Date(date),
        type,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating holiday:", err);
    res.status(500).json({ message: "Failed to update holiday" });
  }
};

// 📌 Delete holiday (Admin only)
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Holiday.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting holiday:", err);
    res.status(500).json({ message: "Failed to delete holiday" });
  }
};
/**
 * 📌 Seed weekly offs (Sundays) into DB for the given year
 * - This will insert weekly offs only if they don't exist already.
 */
// 📌 Manual Seeder for Weekly Offs (Sundays)
exports.seedWeeklyOffs = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const start = moment().year(year).startOf("year");
    const end = moment().year(year).endOf("year");

    let addedCount = 0;

    for (let d = start.clone(); d.isBefore(end); d.add(1, "day")) {
      if (d.day() === 0) {
        const existing = await Holiday.findOne({
          date: d.toDate(),
          type: "weekly",
        });

        if (!existing) {
          await Holiday.create({
            title: "Weekly Off",
            date: d.toDate(),
            type: "weekly",
          });
          addedCount++;
        }
      }
    }

    res.json({ message: `✅ Seeded ${addedCount} weekly offs for ${year}` });
  } catch (err) {
    console.error("❌ Error seeding weekly offs:", err);
    res.status(500).json({ message: "Failed to seed weekly offs" });
  }
};
