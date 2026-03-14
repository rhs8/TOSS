import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState<{ user: { commitment_ends_at: string | null; card_on_file: boolean }; counts: { post_count: number; borrow_count: number } } | null>(null);

  useEffect(() => {
    if (!token) return;
    api.getMe(token).then(setData).catch(() => {});
  }, [token]);

  if (!data) return <div className="container">Loading…</div>;

  const { user, counts } = data;
  const commitmentEnd = user.commitment_ends_at ? new Date(user.commitment_ends_at) : null;
  const active = commitmentEnd && commitmentEnd > new Date();

  return (
    <div className="container">
      <h1>Profile</h1>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", color: "var(--toss-green)" }}>Balance</h2>
        <p>Posts: {counts.post_count} · Borrows: {counts.borrow_count}</p>
        <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>You can borrow as many items as you’ve posted.</p>
      </div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", color: "var(--toss-green)" }}>Commitment</h2>
        {commitmentEnd ? (
          <>
            <p>Ends {commitmentEnd.toLocaleDateString()}</p>
            <p style={{ fontWeight: 500, color: active ? "var(--toss-green)" : "var(--toss-rust)" }}>{active ? "Active" : "Expired"}</p>
          </>
        ) : (
          <p>No active 3-month commitment.</p>
        )}
      </div>
      <div className="card">
        <h2 style={{ fontSize: "1rem", color: "var(--toss-green)" }}>Card on file</h2>
        <p>{user.card_on_file ? "Card on file. You’ll be charged only if you don’t pass an item on." : "No card on file. Add one for accountability."}</p>
      </div>
      <p style={{ marginTop: "1rem" }}>
        <Link to="/post">Post an item</Link> · <Link to="/wishlist">Wishlist</Link>
      </p>
    </div>
  );
}
