const express = require("express");
const router = express.Router();
const {
  createAppreciation,
  getAppreciations,
  updateAppreciation,
  deleteAppreciation,
} = require("../controllers/appreciationController");
const { protect } = require("../middleware/auth");
const Appreciation = require("../models/Appreciation");

// ✅ Protect all routes
router.use(protect);

// Routes
router.route("/").get(getAppreciations).post(createAppreciation);

router.route("/:id").put(updateAppreciation).delete(deleteAppreciation);
// ✅ Get recent appreciations (for dashboard)
router.get("/recent", async (req, res) => {
  try {
    const awards = await Appreciation.find()
      .populate("employee", "name designation profileImage gender") // ✅ Add gender
      .sort({ date: -1 })
      .limit(5);

    res.json(awards);
  } catch (error) {
    console.error("Error fetching recent awards:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
