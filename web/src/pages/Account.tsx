import { Link } from "react-router-dom";

export default function Account() {
  return (
    <div className="account-landing">
      <div className="account-landing__inner">
        <h1 className="account-landing__logo">TOSS</h1>
        <p className="account-landing__tagline">Give something first. Then take what you need. No fees, just community.</p>
        <div className="account-landing__actions">
          <Link to="/signup" className="account-landing__btn account-landing__btn--primary">
            Create account
          </Link>
          <Link to="/signin" className="account-landing__btn account-landing__btn--secondary">
            Sign in
          </Link>
        </div>
        <p className="account-landing__hint">Make an account to post items, browse, and request from others.</p>
      </div>
    </div>
  );
}
