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
  const [seasonalCollection, setSeasonalCollection] = useState("");
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
        seasonal_collection: seasonalCollection || undefined,
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
      <p className="page-intro">The quality of each item is evaluated and confirmed before it goes live.</p>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 480 }}>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-group">
          <label htmlFor="post-title">Title *</label>
          <input id="post-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Electric sander" />
        </div>
        <div className="form-group">
          <label htmlFor="post-category">Category *</label>
          <select id="post-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="post-desc">Description</label>
          <textarea id="post-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Condition, how to use..." />
        </div>
        <div className="form-group">
          <label htmlFor="post-neighbourhood">Neighbourhood (optional)</label>
          <input id="post-neighbourhood" type="text" value={neighbourhood} onChange={(e) => setNeighbourhood(e.target.value)} placeholder="e.g. Burnaby, SFU Burnaby Campus" />
        </div>
        <div className="form-group">
          <label htmlFor="post-seasonal">Seasonal collection (optional)</label>
          <select id="post-seasonal" value={seasonalCollection} onChange={(e) => setSeasonalCollection(e.target.value)} style={{ width: "100%", padding: "0.5rem" }}>
            <option value="">None</option>
            <option value="halloween">Halloween costumes</option>
            <option value="moving">Moving boxes</option>
            <option value="holiday">Holiday decorations</option>
          </select>
        </div>
        <button type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post item"}</button>
      </form>
    </div>
  );
}
