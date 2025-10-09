const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/users");
const { protect } = require("../middleware/auth");

router.put("/profile", protect, updateProfile);

module.exports = router;
