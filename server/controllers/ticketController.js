const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");

exports.createTicket = async (req, res) => {
  try {
    const {
      requester,
      requesterType,
      subject,
      description,
      assignedTo,
      project,
    } = req.body;

    if (!requester || !subject || !description || !requesterType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ticket = new Ticket({
      requester,
      requesterType,
      subject,
      description,
      assignedTo: assignedTo || null,
      project: project || null,
    });

    if (req.file) {
      ticket.files = [`/uploads/tickets/${req.file.filename}`]; // array ✅
    }

    await ticket.save();

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (error) {
    console.error("Ticket create error", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { status } = req.query;
    let query;

    // Admin sees all tickets
    if (req.user.role === "admin") {
      query = {};
    } else {
      // Users see tickets they requested OR assigned to them
      query = {
        $or: [{ requester: req.user._id }, { assignedTo: req.user._id }],
      };
    }

    // Status filter
    if (status && status !== "All") {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate("requester", "name")
      .populate("assignedTo", "name")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Fetch tickets error", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("requester", "name email")
      .populate("assignedTo", "name email")
      .populate("project", "name");

    const comments = await TicketComment.find({ ticket: req.params.id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json({ ticket, comments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ticket details" });
  }
};
exports.addTicketComment = async (req, res) => {
  try {
    const filePath = req.file
      ? `/uploads/ticket-comments/${req.file.filename}`
      : null;

    const comment = await TicketComment.create({
      ticket: req.params.id,
      sender: req.user._id,
      comment: req.body.comment,
      file: filePath,
    });

    res.json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment" });
  }
};
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ message: "Status updated", ticket });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};
exports.getTicketComments = async (req, res) => {
  try {
    const comments = await TicketComment.find({ ticket: req.params.id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("Fetch comments error", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};
exports.deleteTicket = async (req, res) => {
  try {
    // Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete tickets" });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    await TicketComment.deleteMany({ ticket: req.params.id });

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
