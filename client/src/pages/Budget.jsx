import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Budget() {
  const { user } = useAuth();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budget, setBudget] = useState(null);
  const [spent, setSpent] = useState(0);
  const [amountInput, setAmountInput] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-run whenever the selected month changes.
  useEffect(() => {
    loadBudget();
  }, [month]);

  async function loadBudget() {
    const budgetData = await apiRequest(`/budgets?userId=${user._id}&month=${month}`);
    const transactions = await apiRequest(`/transactions?userId=${user._id}`);

    const monthExpenses = transactions.filter((t) => {
      const tMonth = new Date(t.createdAt).toISOString().slice(0, 7);
      return t.type === "expense" && tMonth === month;
    });
    const totalSpent = monthExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

    setBudget(budgetData);
    setSpent(totalSpent);
    setAmountInput(budgetData ? budgetData.amount : "");
  }

  async function handleSave() {
    if (!amountInput || Number(amountInput) <= 0) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setSaving(true);
    try {
      await apiRequest("/budgets", {
        method: "POST",
        body: { userId: user._id, month, amount: Number(amountInput) },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      loadBudget();
    } catch {
      alert("Could not save budget.");
    } finally {
      setSaving(false);
    }
  }

  // Small piece of derived state: work out the "traffic light" level from
  // spent vs budget.amount. Kept as plain variables, not extra state,
  // because it can always be recalculated from budget + spent.
  let status = null;
  if (budget) {
    const pct = Math.min(100, Math.round((spent / budget.amount) * 100));
    const remaining = Math.max(0, budget.amount - spent);
    const level = pct < 70 ? "safe" : pct < 90 ? "warning" : "danger";
    const emoji = level === "safe" ? "✅" : level === "warning" ? "⚠️" : "🚨";
    const message =
      level === "safe"
        ? `You're doing great! ₹${remaining.toLocaleString()} remaining.`
        : level === "warning"
        ? `Getting close! Only ₹${remaining.toLocaleString()} left.`
        : spent > budget.amount
        ? `Over budget by ₹${(spent - budget.amount).toLocaleString()}!`
        : `Almost at your limit! ₹${remaining.toLocaleString()} left.`;
    status = { pct, remaining, level, emoji, message };
  }

  return (
    <div>
      <Navbar />
      <div className="main main-narrow">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="page-title">Monthly Budget</div>

        <div className="mb-3">
          <label className="form-label">Month</label>
          <input className="form-control" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>

        {status ? (
          <div className={`budget-status ${status.level}`}>
            <div className="status-title">{status.emoji} Budget Overview</div>
            <div className="status-amounts">
              <span>
                Spent: <strong>₹{spent.toLocaleString()}</strong>
              </span>
              <span>
                Budget: <strong>₹{budget.amount.toLocaleString()}</strong>
              </span>
              <span>
                Remaining: <strong>₹{status.remaining.toLocaleString()}</strong>
              </span>
            </div>
            <div className="progress">
              <div className={`progress-bar ${status.level}`} style={{ width: `${status.pct}%` }} />
            </div>
            <div className={`status-msg ${status.level}`}>
              {status.message} ({status.pct}% used)
            </div>
          </div>
        ) : (
          <div className="no-budget">No budget set for this month. Set one below!</div>
        )}

        <div className="card">
          {success && <div className="alert-success">Budget saved!</div>}
          <div className="mb-3">
            <label className="form-label">Set Budget Limit (₹)</label>
            <input
              className={`form-control ${invalid ? "is-invalid" : ""}`}
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="e.g. 20000"
            />
            {invalid && <div className="invalid-feedback">Please enter a valid amount.</div>}
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}
