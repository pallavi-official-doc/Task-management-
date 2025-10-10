// controllers/tasks.js
const Task = require("../models/Task");

// Get tasks for logged-in user
exports.getTasks = async (req, res) => {
  try {
    // Only return tasks for this user and populate user info
    const tasks = await Task.find({ user: req.user.id }).populate("user");
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
// Create a task
exports.createTask = async (req, res) => {
  const { title, description } = req.body;
  try {
    const task = new Task({
      title,
      description,
      status: "pending",
      user: req.user.id, // associate task with logged-in user
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated task
    );
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.status(200).json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all tasks
exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "name email");
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
