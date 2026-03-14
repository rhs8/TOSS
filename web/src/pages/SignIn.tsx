import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, refreshUser } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email required.");
      return;
    }
    setLoading(true);
    const devToken = "dev-" + email.replace(/[^a-z0-9]/gi, "").slice(0, 24);
    setToken(devToken);
    const ok = await refreshUser(devToken);
    if (ok) navigate(from || "/browse", { replace: true });
    else setError("No account with this email. Sign up first.");
    setLoading(false);
  }

  return (
    <div className="account-landing">
      <div className="account-landing__inner account-landing__inner--form">
        <h1 className="account-landing__logo">TOSS</h1>
        <p className="account-landing__tagline">Welcome back.</p>
        <form onSubmit={handleSubmit} className="account-form">
          {error && <p className="error-msg">{error}</p>}
          <div className="form-group">
            <label htmlFor="signin-email">Email</label>
            <input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="signin-password">Password</label>
            <input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
          </div>
          <button type="submit" className="account-landing__btn account-landing__btn--primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="account-landing__hint">No account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}
