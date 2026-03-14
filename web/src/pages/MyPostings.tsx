import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function MyPostings() {
  const { token } = useAuth();
  const [items, setItems] = useState<{ id: string; title: string; category_name: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [token]);

  return (
    <div className="container">
      <h1>My postings</h1>
      <p className="page-intro">Items you’ve listed. They appear in Browse when live.</p>
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
            <li key={item.id}>
              <Link to={`/item/${item.id}`} className="card">
                <div className="card__thumb" />
                <span className="card__title">{item.title}</span>
                <p className="card__meta">{item.category_name} · Status: {item.status}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
