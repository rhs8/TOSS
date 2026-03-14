import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState<{ user: { commitment_ends_at: string | null; card_on_file: boolean }; counts: { post_count: number; borrow_count: number } } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setError("");
    api.getMe(token).then(setData).catch(() => setError("Could not load profile."));
  }, [token]);

  if (!data && !error) return <div className="container">Loading…</div>;
  if (error && !data) return <div className="container"><p className="error-msg">{error}</p><Link to="/browse">Back to Browse</Link></div>;

  const { user, counts } = data;

  return (
    <div className="container">
      <h1>Profile</h1>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="section-heading">Balance</h2>
        <p>Posts: {counts.post_count} · Received: {counts.borrow_count}</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>You can have as many items passed along to you as you’ve posted.</p>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 className="section-heading">Keep the cycle going</h2>
        <p>Minimum 1 exchange per month. You can have as many items passed along to you as you’ve posted.</p>
      </div>
      <div className="card">
        <h2 className="section-heading">Card on file</h2>
        <p>{user.card_on_file ? "Card on file. You’ll be charged only if you don’t pass an item on." : "No card on file. Add one for accountability."}</p>
      </div>
      <p style={{ marginTop: "1rem" }}>
        <Link to="/post">Post an item</Link> · <Link to="/wishlist">Wishlist</Link>
      </p>
    </div>
  );
}
