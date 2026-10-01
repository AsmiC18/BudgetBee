import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

// Note on a simplification we made: the original page used the Chart.js
// library to draw canvas charts. For an entry-level build, plain divs
// sized with inline `width` / `height` styles give the same insight
// (relative bar lengths) without pulling in and explaining a whole
// charting library. It's a good thing to mention in an interview:
// "I kept this dependency-free since a styled div is enough for a
// simple bar comparison."

const CATEGORY_COLORS = [
  "#1a7a4a", "#e63946", "#c9a84c", "#3498db", "#9b59b6",
  "#e67e22", "#1abc9c", "#e74c3c", "#2ecc71", "#f39c12",
];

export default function Analytics() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

    // AI Insights state. These hooks must stay above the early `return`s below
  // (React requires hooks to run in the same order on every render).
  const [insightData, setInsightData] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");

  async function generateInsights() {
    setInsightLoading(true);
    setInsightError("");
    try {
      // The server works out this month's totals and asks OpenAI to interpret them.
      const data = await apiRequest("/insights");
      setInsightData(data);
    } catch (err) {
      setInsightError(err.message);
    } finally {
      setInsightLoading(false);
    }
  }

  useEffect(() => {
    apiRequest(`/transactions?userId=${user._id}`)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="main">Loading analytics...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="main">
          <div className="empty-state">
            <p>No transactions yet to analyze!</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Derived numbers, all computed from the one transactions array ---
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach((t) => {
    if (t.type === "income") totalIncome += Number(t.amount);
    else totalExpense += Number(t.amount);
  });

  const categoryMap = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = t.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.amount);
    });
  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = Math.max(...categoryEntries.map(([, amount]) => amount), 1);

  const monthMap = {};
  transactions.forEach((t) => {
    const monthKey = new Date(t.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    if (!monthMap[monthKey]) monthMap[monthKey] = { income: 0, expense: 0 };
    if (t.type === "income") monthMap[monthKey].income += Number(t.amount);
    else monthMap[monthKey].expense += Number(t.amount);
  });
  const monthEntries = Object.entries(monthMap);
  const maxMonthAmount = Math.max(...monthEntries.flatMap(([, v]) => [v.income, v.expense]), 1);

  const maxIncomeExpense = Math.max(totalIncome, totalExpense, 1);

  return (
    <div>
      <Navbar />
      <div className="main">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="page-title">Analytics</div>

        <div className="summary-grid">
          <div className="summary-card income">
            <div className="summary-label">Total Income</div>
            <div className="summary-amount">₹{totalIncome.toLocaleString()}</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-amount">₹{totalExpense.toLocaleString()}</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Net Balance</div>
            <div className="summary-amount">₹{(totalIncome - totalExpense).toLocaleString()}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Transactions</div>
            <div className="summary-amount">{transactions.length}</div>
          </div>
        </div>

                <div className="chart-card insight-card">
          <div className="insight-header">
            <div className="chart-title">✨ AI Insights</div>
            <button
              className="insight-btn"
              onClick={generateInsights}
              disabled={insightLoading}
            >
              {insightLoading
                ? "Analyzing..."
                : insightData
                ? "Regenerate"
                : "Generate insights"}
            </button>
          </div>

          {!insightData && !insightLoading && !insightError && (
            <p className="insight-hint">
              Get a short AI analysis of this month's spending.
            </p>
          )}

          {insightError && <p className="insight-error">{insightError}</p>}

          {insightData && insightData.insights.length === 0 && (
            <p className="insight-hint">
              {insightData.message || "No insights available."}
            </p>
          )}

          {insightData && insightData.insights.length > 0 && (
            <>
              <div className="insight-month">
                {insightData.month} · ₹{insightData.totalSpent.toLocaleString()} spent
              </div>
              <ul className="insight-list">
                {insightData.insights.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Income vs Expenses</div>
          <div className="hbar-row">
            <span className="hbar-label">Income</span>
            <div className="hbar-track">
              <div
                className="hbar-fill income"
                style={{ width: `${(totalIncome / maxIncomeExpense) * 100}%` }}
              />
            </div>
            <span className="hbar-value">₹{totalIncome.toLocaleString()}</span>
          </div>
          <div className="hbar-row">
            <span className="hbar-label">Expenses</span>
            <div className="hbar-track">
              <div
                className="hbar-fill expense"
                style={{ width: `${(totalExpense / maxIncomeExpense) * 100}%` }}
              />
            </div>
            <span className="hbar-value">₹{totalExpense.toLocaleString()}</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Spending by Category</div>
          {categoryEntries.map(([cat, amount], i) => (
            <div className="hbar-row" key={cat}>
              <span className="hbar-label">{cat}</span>
              <div className="hbar-track">
                <div
                  className="hbar-fill"
                  style={{
                    width: `${(amount / maxCategoryAmount) * 100}%`,
                    background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                  }}
                />
              </div>
              <span className="hbar-value">₹{amount.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="chart-card">
          <div className="chart-title">Monthly Trend</div>
          {monthEntries.map(([monthLabel, values]) => (
            <div key={monthLabel} className="month-trend-block">
              <div className="hbar-label month-label">{monthLabel}</div>
              <div className="hbar-row">
                <span className="hbar-sublabel">Income</span>
                <div className="hbar-track">
                  <div className="hbar-fill income" style={{ width: `${(values.income / maxMonthAmount) * 100}%` }} />
                </div>
                <span className="hbar-value">₹{values.income.toLocaleString()}</span>
              </div>
              <div className="hbar-row">
                <span className="hbar-sublabel">Expense</span>
                <div className="hbar-track">
                  <div className="hbar-fill expense" style={{ width: `${(values.expense / maxMonthAmount) * 100}%` }} />
                </div>
                <span className="hbar-value">₹{values.expense.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
