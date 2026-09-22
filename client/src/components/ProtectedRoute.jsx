import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// The old app put this check at the top of every page's <script>:
//   const user = JSON.parse(localStorage.getItem("user"));
//   if (!user) window.location.href = "login.html";
//
// In React we express the same idea as a wrapper component. Any page that
// needs a logged-in user gets wrapped in <ProtectedRoute>...</ProtectedRoute>
// in App.jsx. If there's no user, we redirect with <Navigate> instead of
// rendering the page's children.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
