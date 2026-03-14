import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function SignIn() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Placeholder: real sign-in with Firebase Auth
  function handleSubmit(e: React.FormEvent) {
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
    const devToken = "dev-" + email.replace(/[^a-z0-9]/gi, "").slice(0, 20);
    setToken(devToken);
    navigate("/browse");
  }

  return (
    <div className="container">
      <h1>Sign in</h1>
      <p style={{ opacity: 0.8 }}>Use your institution email (e.g. @sfu.ca).</p>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 400 }}>
        {error && <p style={{ color: "var(--toss-rust)" }}>{error}</p>}
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@sfu.ca" required />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="(dev: ignored)" />
        </div>
        <button type="submit">Sign in</button>
      </form>
      <p style={{ marginTop: "1rem" }}>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
