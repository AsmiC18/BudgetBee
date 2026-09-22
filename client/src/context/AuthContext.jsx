import React, { createContext, useContext, useState } from "react";

// --- What is this file? ---
// The old app stored the logged-in user in localStorage and every single
// page read it out manually with JSON.parse(localStorage.getItem("user")).
// In React, the standard way to share a bit of state (like "who is logged
// in") across many components without passing it down as a prop through
// every level is the Context API. It's a common interview topic:
// "Context = avoiding prop drilling."
//
// AuthContext holds: the current user object, plus login()/logout() helpers.
// We still use localStorage underneath, just in one place instead of nine.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initial state: read localStorage only once, on first render.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small custom hook so pages can write `const { user } = useAuth();`
// instead of importing useContext + AuthContext everywhere.
export function useAuth() {
  return useContext(AuthContext);
}
