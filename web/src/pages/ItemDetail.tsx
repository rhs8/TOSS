import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [data, setData] = useState<{
    item: { id: string; title: string; description?: string; category_name: string; owner_name: string; owner_id: string; status: string; neighbourhood?: string };
    biography: { display_name: string; received_at: string; passed_on_at?: string }[];
  } | null>(null);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [availability, setAvailability] = useState("");
  const [meetingSpots, setMeetingSpots] = useState("");

  useEffect(() => {
    if (!id) return;
    api.getItem(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  async function handleRequest(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token || !id) return;
    setRequesting(true);
    setError("");
    try {
      await api.requestItem(token, id, {
        availability: availability.trim() || undefined,
        meeting_spots: meetingSpots.trim() || undefined,
      });
      setData((d) => d ? { ...d, item: { ...d.item, status: "in_transit" } } : null);
      setShowRequestForm(false);
      setAvailability("");
      setMeetingSpots("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setRequesting(false);
    }
  }

  function openRequestModal() {
    setError("");
    setShowRequestForm(true);
  }

  if (error && !data) return <div className="container"><p className="error-msg">{error}</p><Link to="/browse">Back to Browse</Link></div>;
  if (!data) return <div className="container">Loading…</div>;

  const { item, biography } = data;
  const isOwn = user && item.owner_id === user.id;
  const isLive = item.status === "live";
  const canRequest = token && user && !isOwn && isLive;

  return (
    <div className="container">
      <p style={{ marginBottom: "1rem" }}><Link to="/browse">← Back to Browse</Link></p>
      <div className="card">
        <div className="item-image" />
        <h1 style={{ fontSize: "1.5rem", color: "var(--toss-green)", margin: "0 0 0.25rem" }}>{item.title}</h1>
        <p className="item-meta">{item.category_name} · {item.owner_name}</p>
        {item.neighbourhood && <p className="item-meta" style={{ margin: 0 }}>{item.neighbourhood}</p>}
        {item.description && <p style={{ marginTop: "0.75rem" }}>{item.description}</p>}
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.85 }}>Status: {item.status}</p>
        {canRequest && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.875rem", opacity: 0.85, marginBottom: "0.75rem" }}>
              After you request, you and the current holder will connect. You’ll enter your availability and meeting spots in a popup.
            </p>
            <button type="button" onClick={openRequestModal}>
              Request this item
            </button>
          </div>
        )}

      {canRequest && showRequestForm && (
        <div className="modal-overlay" onClick={() => { setShowRequestForm(false); setError(""); }} aria-hidden="true">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="request-modal-title" aria-modal="true">
            <div className="modal__header">
              <h2 id="request-modal-title">Request: {item.title}</h2>
              <button type="button" className="modal__close" onClick={() => { setShowRequestForm(false); setError(""); }} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleRequest} className="modal__body">
              <p className="modal__intro">Enter dates and times that work for you for a meet-up, and preferred locations. The owner will use this to arrange the handoff.</p>
              <div className="form-group">
                <label htmlFor="request-availability">Dates and times that work for you</label>
                <textarea
                  id="request-availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Weekdays after 5pm, Saturday mornings, March 15-20 any time"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="request-spots">Preferred meeting locations</label>
                <textarea
                  id="request-spots"
                  value={meetingSpots}
                  onChange={(e) => setMeetingSpots(e.target.value)}
                  placeholder="e.g. SFU Burnaby library entrance, Metrotown food court"
                  rows={2}
                />
              </div>
              {error && <p className="error-msg" style={{ marginTop: "0.5rem" }}>{error}</p>}
              <div className="modal__actions">
                <button type="submit" disabled={requesting}>
                  {requesting ? "Submitting…" : "Submit request"}
                </button>
                <button type="button" onClick={() => { setShowRequestForm(false); setError(""); }} className="btn btn--secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        {!token && isLive && !isOwn && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.875rem", opacity: 0.85, marginBottom: "0.75rem" }}>
              Sign in to request this item. To have it passed along to you, post something first; you can have as many items passed along as you’ve posted.
            </p>
            <Link to="/account" className="btn">Sign in to request</Link>
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h2 className="section-heading">Item biography</h2>
        <p style={{ fontSize: "0.875rem", opacity: 0.8, margin: "0 0 0.75rem" }}>Everyone who has held this item: builds trust and backstory.</p>
        <ul className="bio-list">
          {biography.map((h, i) => (
            <li key={i}>
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
