import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles.css";

// This is the one place we "mount" React onto the page (the <div id="root">
// in index.html). Everything else is just components rendering inside it.
//
// BrowserRouter  -> lets us use <Link> / useNavigate() / routes instead of
//                   full-page reloads via window.location.href.
// AuthProvider   -> a Context Provider (see src/context/AuthContext.jsx) that
//                   makes the logged-in user available to every page without
//                   passing it down as a prop manually.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
