import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";
import Navbar from "../components/Navbar.jsx";

export default function Categories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [editId, setEditId] = useState(null); // null = adding, otherwise editing this category's id
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await apiRequest(`/categories?userId=${user._id}`);
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(c) {
    setEditId(c._id);
    setName(c.name);
    setType(c.type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setName("");
    setType("expense");
  }

  async function handleSave() {
    if (!name.trim()) {
      alert("Please enter a category name.");
      return;
    }
    try {
      await apiRequest(editId ? `/categories/${editId}` : "/categories", {
        method: editId ? "PUT" : "POST",
        body: { userId: user._id, name: name.trim(), type },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      cancelEdit();
      loadCategories();
    } catch (err) {
      setError(err.message || "Could not save.");
      setTimeout(() => setError(""), 2500);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await apiRequest(`/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch {
      alert("Could not delete.");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="main main-narrow">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
        <div className="page-title">Categories</div>

        <div className="card">
          {success && <div className="alert-success">Saved!</div>}
          {error && <div className="alert-error">{error}</div>}

          <div className="mb-3">
            <label className="form-label">Category Name</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mb-3">
            <label className="form-label">Type</label>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="edit-actions">
            <button className="btn-primary" onClick={handleSave}>
              {editId ? "Update Category" : "Add Category"}
            </button>
            {editId && (
              <button className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="section-title">Your Categories</div>

        {loading && <div className="empty-state">Loading...</div>}
        {!loading && categories.length === 0 && <div className="empty-state">No categories yet. Add one!</div>}

        <div className="category-list">
          {categories.map((c) => {
            const isDefault = c.userId === "default";
            return (
              <div className="category-item" key={c._id}>
                <div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-meta">
                    {c.type} {isDefault && <span className="default-tag">• Default</span>}
                  </div>
                </div>
                <div className="c-actions">
                  {isDefault ? (
                    <span className="c-meta">Admin managed</span>
                  ) : (
                    <>
                      <button className="btn-link" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button className="btn-link danger" onClick={() => handleDelete(c._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
