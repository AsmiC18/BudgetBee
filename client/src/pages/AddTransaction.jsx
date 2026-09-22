import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function AddTransaction() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Whenever "type" changes (income <-> expense), re-fetch the matching
  // categories. This is the same pattern as loadCategories() in the old
  // code, just triggered by React re-rendering instead of a manual call.
  useEffect(() => {
    apiRequest(`/categories?userId=${user._id}`)
      .then((data) => setCategories(data.filter((c) => c.type === type || c.type === "both")))
      .catch(() => setCategories([]));
  }, [type]);

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

    const fieldErrors = {};
    if (!amount || Number(amount) <= 0) fieldErrors.amount = "Enter a valid amount.";
    if (!category) fieldErrors.category = "Please select a category.";
    if (!date) fieldErrors.date = "Please pick a date.";
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await apiRequest("/transactions", {
        method: "POST",
        body: {
          userId: user._id,
          title: category,
          amount: Number(amount),
          type,
          category,
          note: note.trim(),
          createdAt: date ? new Date(date) : new Date(),
        },
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch {
      setServerError("Could not add transaction. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="main main-narrow">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="page-title">Add Transaction</div>

        <form className="card" onSubmit={handleSubmit} noValidate>
          {success && <div className="alert-success">Transaction added!</div>}
          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="mb-3">
            <label className="form-label">Type</label>
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
          </div>

          <div className="mb-3">
            <label className="form-label">Amount (₹)</label>
            <input
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className={`form-control ${errors.category ? "is-invalid" : ""}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              className={`form-control ${errors.date ? "is-invalid" : ""}`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Note (optional)</label>
            <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
