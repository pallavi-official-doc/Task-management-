const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/chatUpload");

const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/messagesController");

router.use(protect);

// multipart for first message in new conversation
router.post("/conversation", upload.single("file"), createConversation);

router.get("/conversation", getConversations);
router.get("/conversation/:id/messages", getMessages);

// multipart for subsequent messages
router.post("/message", upload.single("file"), sendMessage);
router.delete("/message/:id", protect, deleteMessage);

module.exports = router;
