const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: String,
  amount: Number,
  type: String,
  category: { type: String, default: "general" },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model("Transaction", transactionSchema);