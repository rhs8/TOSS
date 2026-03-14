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
      <p style={{ opacity: 0.8 }}>Post what you need so others can see demand.</p>
      <form onSubmit={handleAdd} className="card" style={{ marginBottom: "1rem", maxWidth: 400 }}>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need?" />
        <button type="submit" disabled={adding || !title.trim()} style={{ marginTop: "0.5rem" }}>Add to wishlist</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {wishlists.map((w) => (
          <li key={w.id} className="card" style={{ marginBottom: "0.5rem" }}>
            <strong>{w.title}</strong>
            {w.description && <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{w.description}</p>}
          </li>
        ))}
      </ul>
      {wishlists.length === 0 && <p>No wishlist items yet.</p>}
    </div>
  );
}
