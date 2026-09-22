require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // the React (Vite) dev server
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use(session({
  secret: "moneymanager_secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.get("/", (req, res) => res.send("BudgetBee API running"));

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const goalRoutes = require("./routes/goals");
const budgetRoutes = require("./routes/budget");
const adminRoutes = require("./routes/admin");

app.use("/api/admin", adminRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));