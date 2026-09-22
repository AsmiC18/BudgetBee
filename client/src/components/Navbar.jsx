import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/categories", label: "Categories" },
  { to: "/goals", label: "Goals" },
  { to: "/budget", label: "Budget" },
  { to: "/analytics", label: "Analytics" },
];

// A "presentational" component: it just displays things and reacts to
// clicks. It reads the current user from context (no props needed) and
// calls logout() from context when the button is clicked.
//
// NavLink (instead of Link) automatically gets an "active" CSS class when
// its "to" matches the current URL - handy for highlighting the current
// page without writing that logic ourselves.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // even if the server call fails, we still log the user out locally
    }
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        BudgetBee
      </Link>

      <div className="navbar-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-right">
        {user && <span className="welcome-text">Hi, {user.name || user.username}!</span>}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
