import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function PostItem() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getCategories().then((d) => {
      setCategories(d.categories);
      if (d.categories[0]) setCategoryId(d.categories[0].id);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title required.");
      return;
    }
    if (!categoryId) {
      setError("Category required.");
      return;
    }
    setSubmitting(true);
    try {
      await api.postItem(token!, {
        title: title.trim(),
        description: description.trim() || undefined,
        category_id: categoryId,
        neighbourhood: neighbourhood.trim() || undefined,
      });
      navigate("/browse");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Post an item</h1>
      <p style={{ opacity: 0.8 }}>New items go through a quick review before going live. Add a photo URL if you have one.</p>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 480 }}>
        {error && <p style={{ color: "var(--toss-rust)" }}>{error}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Electric sander" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Category *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Condition, how to use..." />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Neighbourhood (optional)</label>
          <input type="text" value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} placeholder="e.g. Burnaby" />
        </div>
        <button type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post item"}</button>
      </form>
    </div>
  );
}
