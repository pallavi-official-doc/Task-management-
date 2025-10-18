const Notice = require("../models/Notice");

/* -------------------------------------------------------------
   📌 Create a new notice
------------------------------------------------------------- */
exports.createNotice = async (req, res) => {
  try {
    const { notice, to } = req.body;
    const newNotice = await Notice.create({
      notice,
      to,
      createdBy: req.user.id,
    });
    res.status(201).json(newNotice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------------------------------------------------
   📋 Get all notices with pagination + filters
------------------------------------------------------------- */
exports.getNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    const query = {};

    // 🔍 Search by notice text or "to"
    if (search) {
      query.$or = [
        { notice: { $regex: search, $options: "i" } },
        { to: { $regex: search, $options: "i" } },
      ];
    }

    // 📅 Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Notice.countDocuments(query);
    const notices = await Notice.find(query)
      .populate("createdBy", "name role")
      .populate("replies.user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      data: notices,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------------------------------------------------
   ✏️ Update notice
------------------------------------------------------------- */
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notice.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------------------------------------------------
   ❌ Delete notice
------------------------------------------------------------- */
exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------------------------------------------------
   💬 Reply to notice
------------------------------------------------------------- */
exports.replyNotice = async (req, res) => {
  try {
    const { message } = req.body;
    const notice = await Notice.findById(req.params.id);
    notice.replies.push({ user: req.user.id, message });
    await notice.save();
    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
