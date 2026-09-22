require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Category = require("./models/Categories");

async function removeDuplicates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    
    const defaults = await Category.find({ userId: "default" });
    console.log("Default categories:", defaults.map(d => ({ name: d.name, type: d.type })));

   
    const users = await mongoose.connection.db.collection('users').distinct('_id');
    for (const userId of users) {
      const userCategories = await Category.find({ userId: userId.toString() });
      for (const cat of userCategories) {
        const match = defaults.find(d => d.name.toLowerCase() === cat.name.toLowerCase() && d.type === cat.type);
        if (match) {
          console.log(`Deleting duplicate: ${cat.name} (${cat.type}) for user ${userId}`);
          await Category.findByIdAndDelete(cat._id);
        }
      }
    }

    console.log("Duplicates removed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

removeDuplicates();