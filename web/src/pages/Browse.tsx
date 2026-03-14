import { useEffect, useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

const FALLBACK_CATEGORIES = [
  { id: "1", name: "Board games", slug: "board-games" },
  { id: "2", name: "Books", slug: "books" },
  { id: "3", name: "Clothes & accessories", slug: "clothes-accessories" },
  { id: "4", name: "Cleaning machines", slug: "cleaning-machines" },
  { id: "5", name: "Maintenance devices", slug: "maintenance-devices" },
  { id: "6", name: "Moving boxes", slug: "moving-boxes" },
  { id: "7", name: "Costumes (Halloween & more)", slug: "costumes" },
  { id: "8", name: "House decorations", slug: "house-decorations" },
  { id: "9", name: "Furniture", slug: "furniture" },
  { id: "10", name: "Kitchen", slug: "kitchen" },
  { id: "11", name: "Tools", slug: "tools" },
  { id: "12", name: "Electronics", slug: "electronics" },
  { id: "13", name: "Sports", slug: "sports" },
  { id: "14", name: "Other", slug: "other" },
];

export default function Browse() {
  const { token } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") ?? "";
  const [items, setItems] = useState<{ id: string; title: string; category_name: string; owner_name: string; neighbourhood?: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>(FALLBACK_CATEGORIES);
  const [filter, setFilter] = useState({ category: categoryFromUrl, neighbourhood: "", seasonal: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const neighbourhoods = ["Burnaby", "Vancouver", "SFU Burnaby Campus", "Surrey", "Coquitlam", "New Westminster", ""];

  useEffect(() => {
    setFilter((f) => ({ ...f, category: categoryFromUrl }));
  }, [categoryFromUrl]);

  useEffect(() => {
    api.getCategories().then((d) => setCategories(d.categories || FALLBACK_CATEGORIES)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getItems(token, {
        category: filter.category || undefined,
        neighbourhood: filter.neighbourhood || undefined,
        seasonal: filter.seasonal || undefined,
      })
      .then((d) => setItems(d.items || []))
      .catch((e) => {
        setError(e.message || "Could not load items.");
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [token, filter.category, filter.neighbourhood, filter.seasonal, location.key]);

  function setCategory(value: string) {
    setFilter((f) => ({ ...f, category: value }));
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
  }

  return (
    <div className="container">
      <h1>Browse</h1>
      <p className="page-intro">Explore what’s available. Sign in and post an item to request anything — or add to your wishlist so others can offer. You can have as many items passed along to you as you’ve posted.</p>
      {error && <p className="error-msg">{error}</p>}
      {loading && items.length === 0 && !error && <p>Loading…</p>}
      <div className="filter-bar">
        <select
          value={filter.category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={filter.neighbourhood}
          onChange={(e) => setFilter((f) => ({ ...f, neighbourhood: e.target.value }))}
          aria-label="Neighbourhood"
        >
          <option value="">All neighbourhoods</option>
          {neighbourhoods.filter(Boolean).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select
          value={filter.seasonal}
          onChange={(e) => setFilter((f) => ({ ...f, seasonal: e.target.value }))}
          aria-label="Seasonal"
        >
          <option value="">Any time</option>
          <option value="halloween">Halloween costumes</option>
          <option value="moving">Moving boxes</option>
          <option value="holiday">Holiday decorations</option>
        </select>
      </div>
      {!loading || items.length > 0 ? (
        items.length === 0 ? (
          <div className="empty-state">
            <p>{error ? "Could not load items. Make sure the backend is running." : "No items match your filters yet."}</p>
            <p><Link to="/account">Sign in</Link> to post an item and get the cycle going.</p>
          </div>
        ) : (
        <ul className="card-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={`/item/${item.id}`} className="card">
                <div className="card__thumb" />
                <span className="card__title">{item.title}</span>
                <p className="card__meta">{item.category_name} · {item.owner_name}</p>
                {item.neighbourhood && <p className="card__meta card__meta--small">{item.neighbourhood}</p>}
              </Link>
            </li>
          ))}
        </ul>
        )
      ) : null}
    </div>
  );
}
