const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  startTimer,
  stopTimer,
  getMyTimesheets,
} = require("../controllers/timesheetController");

router.use(protect);

router.post("/start", startTimer);
router.put("/stop/:id", stopTimer);
router.get("/", getMyTimesheets);

module.exports = router;
