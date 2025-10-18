const express = require("express");
const router = express.Router();
const {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
  replyNotice,
} = require("../controllers/noticeController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getNotices).post(createNotice);

router.route("/:id").put(updateNotice).delete(deleteNotice);

router.post("/:id/reply", replyNotice);

module.exports = router;
