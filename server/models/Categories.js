const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: "expense" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", categorySchema);