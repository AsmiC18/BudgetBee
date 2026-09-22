require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Category = require("./models/Categories");

async function updateDefaults() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete "Bills and payments" default
    const deleted = await Category.deleteOne({ userId: "default", name: "Bills and payments" });
    console.log(`Deleted ${deleted.deletedCount} "Bills and payments"`);

    // Add "Bills and utilities" as default
    const existing = await Category.findOne({ userId: "default", name: "Bills and utilities" });
    if (!existing) {
      const billsUtilities = new Category({
        userId: "default",
        name: "Bills and utilities",
        type: "expense"
      });
      await billsUtilities.save();
      console.log("Added Bills and utilities as default");
    } else {
      console.log("Bills and utilities already exists");
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDefaults();