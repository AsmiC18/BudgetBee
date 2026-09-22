import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  // "transactions" is the full list from the server.
  // "filter" is which tab is active (all / income / expense).
  // We derive the *visible* list from these two instead of keeping a
  // second copy of the array around - one source of truth is simpler.
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // which row is being edited, if any

  // useEffect with an empty dependency array [] means "run this once,
  // right after the component first renders" - the React equivalent of
  // the old code's loadTransactions() call at the bottom of the script.
  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/transactions?userId=${user._id}`);
      setTransactions(data);
    } catch {
      setError("Could not load transactions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
      await apiRequest(`/transactions/${id}`, { method: "DELETE" });
      // Update local state instead of re-fetching everything - a quick win
      // once you're comfortable with the basics.
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Could not delete transaction.");
    }
  }

  const visible = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div>
      <Navbar />
      <div className="main">
        <div className="page-header">
          <div className="page-title">Dashboard</div>
          <Link to="/add" className="btn-primary btn-small">
            + Add Transaction
          </Link>
        </div>

        <div className="summary-grid">
          <div className="summary-card income">
            <div className="summary-label">Income</div>
            <div className="summary-amount">₹{income.toLocaleString()}</div>
          </div>
          <div className="summary-card expense">
            <div className="summary-label">Expenses</div>
            <div className="summary-amount">₹{expense.toLocaleString()}</div>
          </div>
          <div className="summary-card balance">
            <div className="summary-label">Balance</div>
            <div className="summary-amount">₹{(income - expense).toLocaleString()}</div>
          </div>
        </div>

        <div className="filter-row">
          {["all", "income", "expense"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div className="empty-state">Loading transactions...</div>}
        {error && <div className="empty-state">⚠️ {error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="empty-state">
            <div className="emoji">🪙</div>
            <p>No transactions yet. Add one!</p>
          </div>
        )}

        <div className="transaction-list">
          {visible.map((t) =>
            editingId === t._id ? (
              <EditTransactionRow
                key={t._id}
                transaction={t}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setTransactions((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
                  setEditingId(null);
                }}
              />
            ) : (
              <TransactionRow
                key={t._id}
                transaction={t}
                onEdit={() => setEditingId(t._id)}
                onDelete={() => handleDelete(t._id)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Breaking the list row into its own small component keeps Dashboard()
// readable. This is a normal way to structure React apps: lots of small
// components rather than one giant one.
function TransactionRow({ transaction: t, onEdit, onDelete }) {
  const date = t.createdAt
    ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const icon = t.type === "income" ? "📥" : "📤";

  return (
    <div className="transaction-item">
      <div className="t-left">
        <div className={`t-icon ${t.type}`}>{icon}</div>
        <div>
          <div className="t-title">{t.note || t.title || t.category}</div>
          <div className="t-date">
            {t.category} · {date}
          </div>
        </div>
      </div>
      <div className="t-right">
        <span className={`t-badge ${t.type}`}>{t.type}</span>
        <span className={`t-amount ${t.type}`}>
          {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
        </span>
        <button className="icon-btn" title="Edit" onClick={onEdit}>
          ✏️
        </button>
        <button className="icon-btn" title="Delete" onClick={onDelete}>
          🗑
        </button>
      </div>
    </div>
  );
}

// A tiny inline form that replaces the old Bootstrap modal. Editing a row
// simply swaps that one row for this form - no separate popup component,
// no extra JS library needed to open/close it.
function EditTransactionRow({ transaction, onCancel, onSaved }) {
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount);
  const [category, setCategory] = useState(transaction.category);
  const [note, setNote] = useState(transaction.note || "");
  const [date, setDate] = useState(
    transaction.createdAt ? new Date(transaction.createdAt).toISOString().split("T")[0] : ""
  );
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    apiRequest(`/categories?userId=${user._id}`)
      .then((data) => setCategories(data.filter((c) => c.type === type || c.type === "both")))
      .catch(() => setCategories([]));
  }, [type]);

  async function handleSave() {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiRequest(`/transactions/${transaction._id}`, {
        method: "PUT",
        body: {
          amount: Number(amount),
          note,
          type,
          category,
          title: category,
          createdAt: date ? new Date(date) : new Date(),
        },
      });
      onSaved(updated);
    } catch {
      alert("Could not update transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="transaction-item edit-row">
      <div className="edit-grid">
        <div className="type-toggle">
          <button
            type="button"
            className={type === "income" ? "toggle-btn active-income" : "toggle-btn"}
            onClick={() => setType("income")}
          >
            📥 Income
          </button>
          <button
            type="button"
            className={type === "expense" ? "toggle-btn active-expense" : "toggle-btn"}
            onClick={() => setType("expense")}
          >
            📤 Expense
          </button>
        </div>

        <input
          className="form-control"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />

        <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <input
          className="form-control"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
        />
      </div>

      <div className="edit-actions">
        <button className="btn-primary btn-small" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn-secondary btn-small" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
