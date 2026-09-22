# BudgetBee – React Edition

This is the original BudgetBee personal finance app, rebuilt so the
frontend (`client/`) is a React app instead of nine separate HTML pages
with jQuery. The backend (`server/`) is untouched Express + MongoDB.

## Tech Stack

- **Frontend:** React 18, React Router, Vite (plain JavaScript, no TypeScript)
- **Backend:** Node.js, Express, MongoDB/Mongoose, express-session (unchanged)

## What changed, and why

| Old (HTML/jQuery)                          | New (React)                                   | Why |
|---------------------------------------------|------------------------------------------------|-----|
| 9 separate `.html` files, full page reloads on every link | 1 single-page app, `react-router-dom` swaps pages without reloading | Standard for any real React app |
| `document.getElementById` + jQuery to read/write the DOM | JSX + `useState`/`useEffect` — the DOM updates itself when state changes | This is the core idea of React |
| `localStorage.getItem("user")` copy-pasted at the top of every page | One `AuthContext` (`src/context/AuthContext.jsx`) shared by all pages | Avoids repeating the same code 9 times; a classic use of the Context API |
| `$.ajax({...})` repeated in every file | One `apiRequest()` helper (`src/api.js`) used everywhere | DRY — same idea, just centralized |
| Bootstrap modal (needs Bootstrap's JS) to edit a transaction | An inline edit form that swaps in for the row | One less library to explain/depend on |
| Chart.js canvas charts on the Analytics page | Plain `<div>` bars sized with CSS `width` | Same information, zero extra dependency |
| `admin.html` (separate admin panel) | **Left out** | Kept the app focused on the core budgeting flow for now |

Every other feature works the same: signup, login, add/edit/delete
transactions, categories, budgets, and savings goals, all talking to the
same API endpoints as before.

## Project structure

```
client/                  React app (Vite)
  src/
    main.jsx             Mounts React onto the page
    App.jsx              All the routes ("/login", "/dashboard", etc.)
    api.js                One function all pages use to call the backend
    context/
      AuthContext.jsx     Who's logged in, shared across the whole app
    components/
      Navbar.jsx          Top nav bar + logout button
      ProtectedRoute.jsx  Redirects to /login if nobody's logged in
    pages/
      Login.jsx, Signup.jsx, Dashboard.jsx, AddTransaction.jsx,
      Budget.jsx, Categories.jsx, Goals.jsx, Analytics.jsx
    styles.css            One plain CSS file for the whole app

server/                  Unchanged Express + MongoDB API
```

## Running it locally

You need two terminals — one for the API, one for the React app.

**1. Backend**
```bash
npm install       # from the project root, installs server dependencies
```
Create a `.env` file in the project root with:
```
MONGO_URI=your-mongodb-connection-string
```
Then start it:
```bash
npx nodemon server/server.js
# or: node server/server.js
```
It runs on `http://127.0.0.1:5000`.

**2. Frontend**
```bash
cd client
npm install
npm run dev
```
It runs on `http://localhost:5173` and opens the app in your browser.

The backend's CORS setting was updated to allow `http://localhost:5173`
(Vite's default port) instead of the old live-server port.

## A few concepts worth knowing for an interview

- **Component:** a JS function that returns JSX (HTML-like syntax). Each
  page (`Dashboard.jsx`, `Login.jsx`, ...) is one component; small pieces
  like `Navbar` are components too, reused across pages.
- **State (`useState`):** a variable that, when changed, makes React
  re-render the component. E.g. `transactions` in `Dashboard.jsx`.
- **Effect (`useEffect`):** code that runs after render, typically to
  fetch data. `useEffect(() => { loadTransactions(); }, [])` runs once,
  right when the page first loads.
- **Props:** how a parent component passes data down to a child, e.g.
  `<TransactionRow transaction={t} onEdit={...} />`.
- **Context:** a way to share state (like the logged-in user) with many
  components without manually passing it down through every layer of
  props ("prop drilling").
- **Controlled inputs:** form inputs whose value comes from state and
  updates via `onChange` — the standard React way to handle forms.

## Not included / left simple on purpose

- No TypeScript, no Redux, no UI component library — plain React + CSS,
  to keep the concepts approachable.
- No admin panel (the old `admin.html`) — can be added back later as an
  `Admin.jsx` page following the same pattern as the others.
- No automated tests.
