import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { api } from "../api";

export default function Wishlist() {
  const { token } = useAuth();
  const [wishlists, setWishlists] = useState<{ id: string; title: string; description?: string; category_name?: string }[]>([]);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.getWishlists(token).then((d) => setWishlists(d.wishlists)).catch(() => {});
  }, [token]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !token) return;
    setAdding(true);
    try {
      const { wishlist } = await api.addWishlist(token, { title: title.trim() });
      setWishlists((w) => [wishlist, ...w]);
      setTitle("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container">
      <h1>Wishlist</h1>
      <p className="page-intro">Add items you need. When someone posts a match, you can get notified.</p>
      <form onSubmit={handleAdd} className="card" style={{ marginBottom: "1.5rem", maxWidth: 400 }}>
        <div className="form-group" style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="wishlist-title">What do you need?</label>
          <input id="wishlist-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Standing desk, board games" />
        </div>
        <button type="submit" disabled={adding || !title.trim()}>Add to wishlist</button>
      </form>
      {wishlists.length === 0 ? (
        <div className="empty-state">
          <p>No wishlist items yet.</p>
          <p>Add something you need — others can see it and post when they have it.</p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {wishlists.map((w) => (
            <li key={w.id} className="card" style={{ marginBottom: "0.5rem" }}>
              <strong>{w.title}</strong>
              {w.category_name && <p className="card__meta" style={{ margin: "0.25rem 0 0" }}>{w.category_name}</p>}
              {w.description && <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", opacity: 0.85 }}>{w.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
