import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Goals() {
  const { user } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [openProgressId, setOpenProgressId] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    try {
      const data = await apiRequest(`/goals?userId=${user._id}`);
      setGoals(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const fieldErrors = {};
    if (!name.trim()) fieldErrors.name = true;
    if (!target || Number(target) <= 0) fieldErrors.target = true;
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSaving(true);
    try {
      await apiRequest("/goals", {
        method: "POST",
        body: { userId: user._id, name: name.trim(), targetAmount: Number(target) },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      setName("");
      setTarget("");
      loadGoals();
    } catch {
      setError("Could not save goal.");
      setTimeout(() => setError(""), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddProgress(goal) {
    const addAmount = Number(progressAmount);
    if (!addAmount || addAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    try {
      await apiRequest(`/goals/${goal._id}`, {
        method: "PUT",
        body: { savedAmount: goal.savedAmount + addAmount },
      });
      setOpenProgressId(null);
      setProgressAmount("");
      loadGoals();
    } catch {
      alert("Could not update progress.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this goal?")) return;
    try {
      await apiRequest(`/goals/${id}`, { method: "DELETE" });
      loadGoals();
    } catch {
      alert("Could not delete goal.");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="main main-narrow">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="page-title">Savings Goals</div>

        <div className="card">
          {success && <div className="alert-success">Goal saved!</div>}
          {error && <div className="alert-error">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Goal Name</label>
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Buy Laptop, Emergency Fund"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Target Amount (₹)</label>
            <input
              className={`form-control ${errors.target ? "is-invalid" : ""}`}
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add Goal"}
          </button>
        </div>

        <div className="section-title">Your Goals</div>

        {loading && <div className="empty-state">Loading...</div>}
        {!loading && goals.length === 0 && (
          <div className="empty-state">
            <p>No goals yet. Add one above!</p>
          </div>
        )}

        <div className="goals-list">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.savedAmount);
            const isDone = pct >= 100;

            return (
              <div className={`goal-card ${isDone ? "completed" : ""}`} key={g._id}>
                <div className="goal-header">
                  <span className="goal-name">{g.name}</span>
                  <span className={`goal-badge ${isDone ? "completed" : "active"}`}>
                    {isDone ? "Achieved!" : "In Progress"}
                  </span>
                </div>
                <div className="goal-amounts">
                  <span>
                    Saved: <span className="saved">₹{g.savedAmount.toLocaleString()}</span>
                  </span>
                  <span className="target">Target: ₹{g.targetAmount.toLocaleString()}</span>
                </div>
                <div className="progress">
                  <div className={`progress-bar ${isDone ? "completed" : ""}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="goal-footer">
                  <span className="goal-remaining">
                    {isDone ? "Goal complete!" : `₹${remaining.toLocaleString()} remaining (${pct}%)`}
                  </span>
                  <div className="goal-actions">
                    {!isDone && (
                      <button
                        className="btn-link"
                        onClick={() => setOpenProgressId(openProgressId === g._id ? null : g._id)}
                      >
                        + Add Progress
                      </button>
                    )}
                    <button className="btn-link danger" onClick={() => handleDelete(g._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {openProgressId === g._id && (
                  <div className="add-progress-form">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Amount to add (₹)"
                      value={progressAmount}
                      onChange={(e) => setProgressAmount(e.target.value)}
                    />
                    <button className="btn-primary btn-small" onClick={() => handleAddProgress(g)}>
                      Save
                    </button>
                    <button
                      className="btn-secondary btn-small"
                      onClick={() => {
                        setOpenProgressId(null);
                        setProgressAmount("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
