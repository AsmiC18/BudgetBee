const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Category = require("../models/Categories");


router.post("/signup", async (req, res) => {
  const { name,username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, username, email, password: hashedPassword });
  await user.save();

  res.json({ message: "User created" });
});


router.post("/login", async (req, res) => {
  const {username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)return res.status(400).json({ message: "Account does not exist" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  req.session.user = { 
    _id: user._id,
    name: user.name,  
    username: user.username,
    email: user.email,
    role: user.role 
};
  res.json({ message: "Login successful", user });
});


router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});


router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

module.exports = router;