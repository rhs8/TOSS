import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function Browse() {
  const { token } = useAuth();
  const [items, setItems] = useState<{ id: string; title: string; category_name: string; owner_name: string; neighbourhood?: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [filter, setFilter] = useState({ category: "", neighbourhood: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .getItems(token, { category: filter.category || undefined, neighbourhood: filter.neighbourhood || undefined })
      .then((d) => setItems(d.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, filter.category, filter.neighbourhood]);

  if (loading && items.length === 0) return <div className="container">Loading…</div>;
  if (error) return <div className="container"><p style={{ color: "var(--toss-rust)" }}>{error}</p></div>;

  return (
    <div className="container">
      <h1>Browse</h1>
      <p style={{ opacity: 0.8 }}>Post at least one item to browse. You can borrow as many items as you’ve posted.</p>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select
          value={filter.category}
          onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
          style={{ padding: "0.5rem", borderRadius: "0.5rem" }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Neighbourhood"
          value={filter.neighbourhood}
          onChange={(e) => setFilter((f) => ({ ...f, neighbourhood: e.target.value }))}
          style={{ maxWidth: 200 }}
        />
      </div>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
        {items.map((item) => (
          <li key={item.id}>
            <Link to={`/item/${item.id}`} className="card" style={{ display: "block" }}>
              <div style={{ aspectRatio: "16/10", background: "rgba(143,188,143,0.2)", borderRadius: "0.5rem", marginBottom: "0.5rem" }} />
              <strong style={{ color: "var(--toss-green)" }}>{item.title}</strong>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", opacity: 0.8 }}>{item.category_name} · {item.owner_name}</p>
              {item.neighbourhood && <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.7 }}>{item.neighbourhood}</p>}
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p>No items yet. Be the first to post one.</p>}
    </div>
  );
}
