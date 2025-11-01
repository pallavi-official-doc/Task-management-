const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  getTicketDetails,
  updateTicketStatus,
  addTicketComment,
  getTicketComments,
  deleteTicket,
} = require("../controllers/ticketController");

const { protect } = require("../middleware/auth");
const upload = require("../middleware/ticketUpload");
const uploadComment = require("../middleware/commentUpload");

// ✅ Create ticket (with file)
router.post("/", protect, upload.single("files"), createTicket);

// ✅ Get all tickets for user/admin
router.get("/", protect, getTickets);

// ✅ Get single ticket details (with comments)
router.get("/:id", protect, getTicketDetails);

// ✅ Update ticket status
router.put("/:id/status", protect, updateTicketStatus);

// ✅ Add comment (text + file upload)
router.post(
  "/:id/comments",
  protect,
  uploadComment.single("file"),
  addTicketComment
);

// ✅ Get ticket comments
router.get("/:id/comments", protect, getTicketComments);
// ✅ Delete Ticket (Admin Only)
router.delete("/:id", protect, deleteTicket);

module.exports = router;
