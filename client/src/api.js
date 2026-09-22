// Every page in this app needs to talk to the Express server, so instead of
// repeating fetch(...) with the same options in eight different files, we
// write it once here. This is the same idea as the $.ajax calls in the old
// jQuery version - just wrapped in one reusable function.

const API_BASE = "http://127.0.0.1:5000/api";

export async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    credentials: "include", // sends the login session cookie
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  // The server always responds with JSON, even for errors.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}
