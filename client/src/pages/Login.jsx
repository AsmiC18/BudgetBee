import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Controlled inputs: the input's value always comes from React state,
  // and every keystroke updates that state via onChange. This is the
  // standard React form pattern (as opposed to reading values out of the
  // DOM with document.getElementById, like the old jQuery version did).
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Skip straight to the dashboard.
  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from doing a full page reload
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { username: username.trim(), password },
      });
      login(data.user);
      navigate(data.user.role === "admin" ? "/dashboard" : "/dashboard");
    } catch (err) {
      setError(err.message);
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
          <p>Track your finances with ease</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="divider">or</div>
          <div className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
