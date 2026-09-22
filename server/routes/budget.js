const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");


router.get("/", async (req, res) => {
  try {
    const { userId, month } = req.query;
    const data = await Budget.findOne({ userId, month });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { userId, month, amount } = req.body;
    const existing = await Budget.findOne({ userId, month });
    if (existing) {
      existing.amount = amount;
      await existing.save();
      res.json(existing);
    } else {
      const budget = new Budget({ userId, month, amount });
      await budget.save();
      res.json(budget);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;