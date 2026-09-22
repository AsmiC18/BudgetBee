const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Category = require("../models/Categories");


router.get("/users", async (req, res) => {
  try {
    const { includeAdmin } = req.query;  
    let query = {};
    if (includeAdmin !== "true") {
      query = { role: { $ne: "admin" } }; 
    }
    const users = await User.find(query, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });
    res.json({ message: "User and their transactions deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/users/:id/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/transactions/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalTransactions = await Transaction.countDocuments();
    const totalIncome = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({
      totalUsers,
      totalTransactions,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/categories", async (req, res) => {
  try {
    const cats = await Category.find({ userId: "default" });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/categories", async (req, res) => {
  try {
    const cat = new Category({ userId: "default", name: req.body.name, type: req.body.type });
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put("/categories/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, type: req.body.type },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/categories/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;