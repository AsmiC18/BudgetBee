const express = require("express");
const router = express.Router();
const Category = require("../models/Categories");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await Category.find({ $or: [{ userId }, { userId: "default" }] });
    const defaultCategories = data.filter(c => c.userId === "default");
    const userCategories = data.filter(c => c.userId === userId && !defaultCategories.some(d => d.name.toLowerCase() === c.name.toLowerCase() && d.type === c.type));
    res.json([...defaultCategories, ...userCategories]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add category
router.post("/", async (req, res) => {
  try {
    // Check if a default category with the same name and type already exists (case-insensitive)
    const existingDefault = await Category.findOne({ userId: "default", name: { $regex: new RegExp(`^${req.body.name}$`, 'i') }, type: req.body.type });
    if (existingDefault) {
      return res.status(400).json({ message: "A default category with this name and type already exists. You cannot create a duplicate." });
    }
    const category = new Category(req.body);
    const saved = await category.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Edit category
router.put("/:id", async (req, res) => {
  try {

    const category = await Category.findById(req.params.id);

    if (category.userId === "default") {
      return res.status(403).json({ message: "Default categories cannot be edited" });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, type: req.body.type },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    //  Block default categories
    if (category.userId === "default") {
      return res.status(403).json({ message: "Default categories cannot be deleted" });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted" });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;