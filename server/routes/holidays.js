const express = require("express");
const router = express.Router();

const {
  getHolidays,
  getUpcomingHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidays");

const { protect, authorize } = require("../middleware/auth");

// ✅ All routes require login
router.use(protect);

/**
 * 👤 User Routes
 * --------------------------
 */

// 📌 Get all holidays with filters (year, type, search, optional)
router.get("/", getHolidays);

// 📅 Get upcoming holidays (including recurring) → for dashboard
router.get("/upcoming", getUpcomingHolidays);

/**
 * 👑 Admin Routes
 * --------------------------
 */

// ➕ Create a new holiday
router.post("/", authorize("admin"), createHoliday);

// ✏️ Update a holiday
router.put("/:id", authorize("admin"), updateHoliday);

// 🗑️ Delete a holiday
router.delete("/:id", authorize("admin"), deleteHoliday);

module.exports = router;
