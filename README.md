# BudgetBee

A personal finance app built with **React, Node.js, Express, and MongoDB**.

## Tech Stack

* React 18 + Vite
* React Router
* Node.js + Express
* MongoDB + Mongoose
* Plain JavaScript and CSS

## Project Structure

```text
BudgetBee/
├── client/     # React frontend
└── server/     # Express backend
```

## Run Locally

### 1. Start the backend

From the project root:

```bash
npm install
```

Create a `.env` file:

```env
MONGO_URI=your-mongodb-connection-string
```

Then start the server:

```bash
npx nodemon server/server.js
```

The backend runs on:

```text
http://127.0.0.1:5000
```

### 2. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Features

* User login and signup
* Dashboard
* Add and manage transactions
* Budget tracking
* Categories
* Financial goals
* Analytics

## Notes

This project uses React for the frontend and Express + MongoDB for the backend. The frontend uses React components, routing, state, and context for authentication.
