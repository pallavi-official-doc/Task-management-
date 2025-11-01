// const Conversation = require("../models/Conversation");
// const Message = require("../models/Message");

// // Create or load conversation + send first message
// exports.createConversation = async (req, res) => {
//   try {
//     const { receiverId, text } = req.body;

//     let conversation = await Conversation.findOne({
//       members: { $all: [req.user.id, receiverId] },
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         members: [req.user.id, receiverId],
//       });
//     }

//     const message = await Message.create({
//       conversationId: conversation._id,
//       sender: req.user.id,
//       text,
//     });

//     res.json({ conversation, message });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// // Get logged user's conversations
// exports.getConversations = async (req, res) => {
//   try {
//     const conversations = await Conversation.find({
//       members: { $in: [req.user.id] },
//     })
//       .populate("members", "_id name email")
//       .sort({ updatedAt: -1 });

//     res.json(conversations);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// // Load messages in conversation
// exports.getMessages = async (req, res) => {
//   try {
//     const messages = await Message.find({
//       conversationId: req.params.id,
//     })
//       .populate("sender", "_id name")
//       .sort({ createdAt: 1 });

//     res.json(messages);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };

// // Send new message
// exports.sendMessage = async (req, res) => {
//   try {
//     const { conversationId, text } = req.body;

//     const message = await Message.create({
//       conversationId,
//       sender: req.user.id,
//       text,
//     });

//     res.json(message);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// };
const path = require("path");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// helper: build public URL for saved file
const buildFileUrl = (req, filename) =>
  filename ? `/uploads/messages/${path.basename(filename)}` : null;

// Create or load conversation + send first message
exports.createConversation = async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [req.user.id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user.id, receiverId],
      });
    }

    const fileUrl = req.file ? buildFileUrl(req, req.file.path) : null;

    let message = await Message.create({
      conversationId: conversation._id,
      sender: req.user.id,
      text: text || "",
      file: fileUrl,
      status: "sent", // ✅ default when created
    });

    // ✅ Ensure DB saved status
    message.status = "sent";
    await message.save();

    // bump conversation updatedAt
    await conversation.updateOne({ updatedAt: new Date() });

    res.json({ conversation, message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user.id] },
    })
      .populate("members", "_id name email")
      .sort({ updatedAt: -1 });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...conv._doc,
          lastMessage: lastMsg?.text || "",
          lastMessageTime: lastMsg?.createdAt || conv.updatedAt,
          lastMessageStatus: lastMsg?.status || "sent", // ✅ optional: show ticks in list
        };
      })
    );

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate("sender", "_id name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Send new message (with optional attachment)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const fileUrl = req.file ? buildFileUrl(req, req.file.path) : null;

    let message = await Message.create({
      conversationId,
      sender: req.user.id,
      text: text || "",
      file: fileUrl,
      status: "sent", // ✅ initial state
    });

    // ✅ ensure saved message status
    message.status = "sent";
    await message.save();

    // bump conversation updatedAt
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    res.json(message);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
// exports.deleteMessage = async (req, res) => {
//   try {
//     const msg = await Message.findById(req.params.id);

//     if (!msg) return res.status(404).json({ msg: "Message not found" });

//     // Only sender can delete
//     if (msg.sender.toString() !== req.user.id) {
//       return res.status(401).json({ msg: "Not authorized" });
//     }

//     msg.isDeleted = true;
//     msg.text = "";
//     msg.file = null;
//     msg.deletedText = "This message was deleted";

//     await msg.save();

//     // notify receiver via socket
//     socket.emit("messageDeleted", { messageId: msg._id });

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ✅ Only sender can delete
    if (msg.sender.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the sender can delete this message" });
    }

    await Message.findByIdAndDelete(req.params.id);

    // ✅ Notify via socket (optional)
    global.io?.emit("messageDeleted", { messageId: msg._id });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
