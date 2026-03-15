import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function MyPostings() {
  const { token } = useAuth();
  const [items, setItems] = useState<{ id: string; title: string; category_name: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadItems() {
    if (!token) return;
    setLoading(true);
    setError("");
    api
      .getMyItems(token)
      .then((d) => setItems(d.items || []))
      .catch((e) => {
        setError(e.message || "Could not load your items.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!token) return;
    loadItems();
  }, [token]);

  async function handleDelete(itemId: string) {
    if (!token || deletingId) return;
    if (!confirm("Remove this posting? It will no longer appear in Browse.")) return;
    setDeletingId(itemId);
    try {
      await api.deleteItem(token, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container">
      <h1>My postings</h1>
      <p className="page-intro">Items you’ve listed. Each one also appears in Browse so other users can find and request them.</p>
      {error && <p className="error-msg">{error}</p>}
      {loading && <p>Loading…</p>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <p>You haven’t posted any items yet.</p>
          <p><Link to="/post">Post an item</Link> to get started.</p>
        </div>
      )}
      {!loading && items.length > 0 && (
        <ul className="card-list">
          {items.map((item) => (
            <li key={item.id} className="card-list__item-with-actions">
              <Link to={`/item/${item.id}`} className="card">
                <div className="card__thumb" />
                <span className="card__title">{item.title}</span>
                <p className="card__meta">{item.category_name} · Status: {item.status}</p>
              </Link>
              <button
                type="button"
                className="btn btn--danger"
                onClick={(e) => { e.preventDefault(); handleDelete(item.id); }}
                disabled={deletingId === item.id}
                aria-label={`Delete ${item.title}`}
              >
                {deletingId === item.id ? "Removing…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
