const express = require("express");
const router = express.Router();
const Appreciation = require("../models/Appreciation");
const { protect } = require("../middleware/auth"); // ✅ Make sure this path is correct

// ✅ Protect all appreciation routes
router.use(protect);

// ✅ Get All Appreciations (Admin)
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const appreciations = await Appreciation.find()
      .populate("givenTo", "name designation")
      .sort({ createdAt: -1 });

    res.json(appreciations);
  } catch (err) {
    console.error("Error in GET /appreciations:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Logged-in Employee Appreciations
router.get("/my", async (req, res) => {
  try {
    const appreciations = await Appreciation.find({ givenTo: req.user._id })
      .populate("givenTo", "name designation")
      .sort({ createdAt: -1 });

    res.json(appreciations);
  } catch (err) {
    console.error("Error in GET /appreciations/my:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create Appreciation (Admin)
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { givenTo, awardName, givenOn } = req.body;

    const newAppreciation = await Appreciation.create({
      givenTo,
      awardName,
      givenOn: givenOn || new Date(),
      createdBy: req.user._id,
    });

    res.status(201).json(newAppreciation);
  } catch (err) {
    console.error("Error in POST /appreciations:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Recent Appreciations for Dashboard
router.get("/recent", async (req, res) => {
  try {
    const appreciations = await Appreciation.find()
      .populate("givenTo", "name designation profileImage")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(appreciations);
  } catch (err) {
    console.error("Error in GET /appreciations/recent:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
