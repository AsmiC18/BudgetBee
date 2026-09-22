import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";

// Simple validation rules, kept as plain functions rather than a validation
// library - easy to read and easy to explain in an interview.
function validate({ name, username, email, password, confirm }) {
  const errors = {};

  if (!name.trim()) errors.name = "Name is required.";
  else if (!/^[a-zA-Z ]+$/.test(name)) errors.name = "Name must contain only letters and spaces.";

  if (!username.trim()) errors.username = "Username is required.";
  else if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username))
    errors.username = "Username must be 3-20 characters (letters, numbers, _, . only).";

  if (!email.trim()) errors.email = "Email is required.";
  else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email))
    errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password))
    errors.password = "Min 6 chars with an uppercase, lowercase, number and special character (@$!%*?&).";

  if (!confirm) errors.confirm = "Please confirm your password.";
  else if (confirm !== password) errors.confirm = "Passwords do not match.";

  return errors;
}

export default function Signup() {
  const navigate = useNavigate();

  // One object for all the form fields is a common alternative to a
  // separate useState() per field - fewer lines, same idea.
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: {
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card-wrapper">
        <div className="brand">
          <div className="brand-icon">🐝</div>
          <h1>BudgetBee</h1>
          <p>Create your account</p>
        </div>

        <form className="card" onSubmit={handleSubmit} noValidate>
          {serverError && <div className="alert-error">{serverError}</div>}
          {success && <div className="alert-success">Account created! Redirecting to login...</div>}

          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
            />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirm ? "is-invalid" : ""}`}
              value={form.confirm}
              onChange={(e) => updateField("confirm", e.target.value)}
            />
            {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
