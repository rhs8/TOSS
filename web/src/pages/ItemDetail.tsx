import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [data, setData] = useState<{
    item: { id: string; title: string; description?: string; category_name: string; owner_name: string; owner_id: string; status: string; neighbourhood?: string };
    biography: { display_name: string; received_at: string; passed_on_at?: string }[];
  } | null>(null);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getItem(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  async function handleRequest() {
    if (!token || !id) return;
    setRequesting(true);
    try {
      await api.requestItem(token, id);
      setData((d) => d ? { ...d, item: { ...d.item, status: "in_transit" } } : null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setRequesting(false);
    }
  }

  if (error && !data) return <div className="container"><p style={{ color: "var(--toss-rust)" }}>{error}</p></div>;
  if (!data) return <div className="container">Loading…</div>;

  const { item, biography } = data;
  const canRequest = token && user && item.owner_id !== user.id && item.status === "live";

  return (
    <div className="container">
      <div className="card">
        <div style={{ aspectRatio: "16/10", background: "rgba(143,188,143,0.2)", borderRadius: "0.5rem", marginBottom: "1rem" }} />
        <h1 style={{ fontSize: "1.5rem", color: "var(--toss-green)" }}>{item.title}</h1>
        <p style={{ margin: "0.25rem 0", fontSize: "0.875rem", opacity: 0.8 }}>{item.category_name} · {item.owner_name}</p>
        {item.neighbourhood && <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.7 }}>{item.neighbourhood}</p>}
        {item.description && <p style={{ marginTop: "0.75rem" }}>{item.description}</p>}
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>Status: {item.status}</p>
        {canRequest && (
          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleRequest} disabled={requesting}>
              {requesting ? "Requesting…" : "Request this item"}
            </button>
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", color: "var(--toss-green)" }}>Item biography</h2>
        <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>Everyone who has held this item.</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {biography.map((h, i) => (
            <li key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(143,188,143,0.3)" }}>
              <strong>{h.display_name || "Anonymous"}</strong>
              {" "}received {new Date(h.received_at).toLocaleDateString()}
              {h.passed_on_at ? ` · passed on ${new Date(h.passed_on_at).toLocaleDateString()}` : " · current holder"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
