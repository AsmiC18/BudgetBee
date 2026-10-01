const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// GET /api/insights
// Flow: MongoDB transactions -> we calculate totals -> Gemini interprets
// them -> we send 2-4 short insights back to the Analytics page.
//
// Design choices:
//  - The user comes from the login session, not from the query string.
//  - All arithmetic is done here in plain JavaScript (exact, repeatable).
//    The AI model only receives the finished totals and writes about them.
//  - The API key stays in server/.env and never reaches the browser.
router.get("/", async (req, res) => {
  try {
    const sessionUser = req.session && req.session.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Please log in to get insights." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ message: "AI insights are not configured on the server." });
    }

    // 1. Current month's expenses for this user
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthLabel = now.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    const expenses = await Transaction.find({
      userId: String(sessionUser._id),
      type: "expense",
      createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    if (expenses.length === 0) {
      return res.json({
        month: monthLabel,
        totalSpent: 0,
        categories: [],
        insights: [],
        message: "No expenses recorded this month yet.",
      });
    }

    // 2. Calculate totals by category (no AI involved)
    const totals = {};
    let totalSpent = 0;
    expenses.forEach((t) => {
      const cat = t.category || "Other";
      const amount = Number(t.amount) || 0;
      totals[cat] = (totals[cat] || 0) + amount;
      totalSpent += amount;
    });

    const categories = Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Ask Gemini to interpret the numbers
    const dataLines = categories
      .map((c) => `- ${c.category}: ₹${c.amount} (${c.percent}% of total)`)
      .join("\n");

    const systemPrompt =
      "You are a friendly personal finance assistant inside a budgeting app. " +
      "You are given a user's already-calculated spending totals for one month. " +
      "Do not recalculate or invent numbers; only use the figures provided. " +
      "Write 2 to 4 short insights, one per line, each starting with '- '. " +
      "Mention the highest expense category, point out any category that takes a " +
      "large share of spending, and end with one practical suggestion for next month. " +
      "Use ₹ for amounts. No headings, no extra text.";

    const userPrompt = `Spending for ${monthLabel} (total ₹${totalSpent}):\n${dataLines}`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          // High limit because some Gemini models spend tokens "thinking"
          // before they write the answer.
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!aiResponse.ok) {
      const errBody = await aiResponse.json().catch(() => ({}));
      console.log("Gemini error:", aiResponse.status, errBody.error?.message);
      return res
        .status(502)
        .json({ message: "The AI service could not generate insights right now." });
    }

    const aiData = await aiResponse.json();
    const parts = aiData.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter((part) => !part.thought)
      .map((part) => part.text || "")
      .join("\n");

    // 4. Turn "- line" text into a clean array of 2-4 insights
    const insights = text
      .split("\n")
      .map((line) => line.replace(/^[-•*\d.)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 4);

    res.json({ month: monthLabel, totalSpent, categories, insights });
  } catch (err) {
    console.log("Insights error:", err.message);
    res.status(500).json({ message: "Could not generate insights. Please try again." });
  }
});

module.exports = router;