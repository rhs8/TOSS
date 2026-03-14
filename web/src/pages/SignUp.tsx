import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, refreshUser } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email required.");
      return;
    }
    setSubmitting(true);
    const firebaseUid = "dev-" + email.replace(/[^a-z0-9]/gi, "").slice(0, 24);
    try {
      await api.signUp({ firebase_uid: firebaseUid, email: email.trim(), display_name: displayName.trim() || undefined });
      setToken(firebaseUid);
      const ok = await refreshUser(firebaseUid);
      if (ok) navigate(from || "/browse", { replace: true });
      else setError("Account created. Try signing in.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="account-landing">
      <div className="account-landing__inner account-landing__inner--form">
        <h1 className="account-landing__logo">TOSS</h1>
        <p className="account-landing__tagline">Join the community.</p>
        <form onSubmit={handleSubmit} className="account-form">
          {error && <p className="error-msg">{error}</p>}
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-name">Display name</label>
            <input id="signup-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" autoComplete="name" />
          </div>
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="new-password" />
          </div>
          <button type="submit" className="account-landing__btn account-landing__btn--primary" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
            {submitting ? "Signing up…" : "Sign up"}
          </button>
        </form>
        <p className="account-landing__hint">Already have an account? <Link to="/signin">Sign in</Link></p>
      </div>
    </div>
  );
}
