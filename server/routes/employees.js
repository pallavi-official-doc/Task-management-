const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getUpcomingBirthdays,
  getAppreciations,
  getOnLeaveToday,
  getWFHToday,
} = require("../controllers/employees");

router.use(protect);

router.get("/birthdays", getUpcomingBirthdays);
router.get("/appreciations", getAppreciations);
router.get("/onleave", getOnLeaveToday);
router.get("/wfh", getWFHToday);

module.exports = router;
