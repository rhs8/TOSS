import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function SignUp() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email required.");
      return;
    }
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || !["sfu.ca", "ubc.ca"].includes(domain)) {
      setError("Use an institution email (e.g. @sfu.ca).");
      return;
    }
    const firebaseUid = "dev-" + email.replace(/[^a-z0-9]/gi, "").slice(0, 24);
    try {
      await api.signUp({ firebase_uid: firebaseUid, email: email.trim(), display_name: displayName.trim() || undefined });
      setToken(firebaseUid);
      navigate("/browse");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    }
  }

  return (
    <div className="container">
      <h1>Sign up</h1>
      <p style={{ opacity: 0.8 }}>Institution email required. 3-month renewable commitment. Card on file for accountability.</p>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400 }}>
        {error && <p style={{ color: "var(--toss-rust)" }}>{error}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@sfu.ca" required />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Display name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="(connect Firebase Auth later)" />
        </div>
        <button type="submit">Sign up</button>
      </form>
      <p style={{ marginTop: "1rem" }}>Already have an account? <Link to="/signin">Sign in</Link></p>
    </div>
  );
}
