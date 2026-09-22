const express = require("express");
const router = express.Router();
const Goal = require("../models/Goals");

// Get all goals
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await Goal.find({ userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add goal
router.post("/", async (req, res) => {
  try {
    const goal = new Goal(req.body);
    const saved = await goal.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update progress
router.put("/:id", async (req, res) => {
  try {
    const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete goal
router.delete("/:id", async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;