import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "./auth";

export default function Layout() {
  const { user } = useAuth();

  return (
    <div>
      <header style={{ borderBottom: "1px solid rgba(143,188,143,0.5)", background: "rgba(255,255,255,0.9)", padding: "0.75rem 1rem" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--toss-green)" }}>Toss</Link>
          <nav style={{ display: "flex", gap: "0.5rem" }}>
            {user ? (
              <>
                <Link to="/browse">Browse</Link>
                <Link to="/post">Post item</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/signin">Sign in</Link>
                <Link to="/signup">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
