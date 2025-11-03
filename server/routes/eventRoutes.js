const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/auth");

// ===== Multer (file upload) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads", "events")),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ===== GET all events (everyone logged-in can view) =====
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("assignedTo", "name email role")
      .populate("client", "name email")
      .sort({ startDate: 1, startTime: 1 });
    res.json(events);
  } catch (e) {
    res.status(500).json({ message: "Failed to load events" });
  }
});

// ===== CREATE (Admin only) - multipart/form-data =====
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("file"),
  async (req, res) => {
    try {
      const body = req.body;

      const event = await Event.create({
        title: body.title,
        color: body.color,
        location: body.location,
        description: body.description,
        startDate: body.startDate,
        startTime: body.startTime,
        endDate: body.endDate,
        endTime: body.endTime,
        assignedTo: body.assignedTo ? [].concat(body.assignedTo) : [],
        host: body.host || "admin",
        client: body.host === "client" && body.client ? body.client : null,
        status: body.status || "Pending",
        eventLink: body.eventLink,
        filePath: req.file ? `/uploads/events/${req.file.filename}` : undefined,
        createdBy: req.user._id,
      });

      // 🔔 Notify assigned users in real-time (if socket is set)
      const io = req.app.get("io");
      if (io && event.assignedTo?.length) {
        io.emit("eventAssigned", { users: event.assignedTo, event });
      }

      res.json(event);
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Error creating event" });
    }
  }
);

// ===== UPDATE (Admin only) =====
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("file"),
  async (req, res) => {
    try {
      const update = { ...req.body };

      // ensure assignedTo is array
      update.assignedTo = req.body.assignedTo
        ? [].concat(req.body.assignedTo)
        : [];

      // handle file
      if (req.file) update.filePath = `/uploads/events/${req.file.filename}`;

      // reset client if host not client
      if (update.host !== "client") update.client = null;

      const event = await Event.findByIdAndUpdate(req.params.id, update, {
        new: true,
      }).populate("assignedTo client createdBy");

      res.json(event);
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Error updating event" });
    }
  }
);

// ===== DELETE (Admin only) =====
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (e) {
    res.status(400).json({ message: "Error deleting event" });
  }
});

module.exports = router;
