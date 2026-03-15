import { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

export default function Layout() {
  const { user, setToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSignOut() {
    setToken(null);
    navigate("/");
    setSidebarOpen(false);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div>
      <header className="site-header site-header--minimal">
        <div className="container site-header__inner">
          <button
            type="button"
            className="site-logo site-logo--btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-expanded={sidebarOpen}
            aria-label="Open menu"
          >
            TOSS
          </button>
        </div>
      </header>

      <div
        className={`sidebar-backdrop ${sidebarOpen ? "sidebar-backdrop--open" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <span className="sidebar__title">Menu</span>
          <button
            type="button"
            className="sidebar__close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="sidebar__nav">
          <Link to="/" className="sidebar__menu-item sidebar__link" onClick={closeSidebar}>
            Home
          </Link>
          <Link to="/browse" className="sidebar__menu-item sidebar__link" onClick={closeSidebar}>
            Browse
          </Link>

          <Link to="/wishlist" className="sidebar__menu-item sidebar__link" onClick={closeSidebar}>
            Wishlist
          </Link>
          {!user && (
            <p className="sidebar__hint">Sign in to add items you need. When someone posts a match, you can get notified.</p>
          )}

          <Link to="/community" className="sidebar__menu-item sidebar__link" onClick={closeSidebar}>
            Community Space
          </Link>

          <Link
            to={user ? "/profile" : "/account"}
            className="sidebar__menu-item sidebar__link"
            onClick={closeSidebar}
          >
            Account
          </Link>
          {!user && <p className="sidebar__hint">Sign in or sign up to view your profile.</p>}
          {user && (
            <>
              <NavLink to="/post" className="sidebar__link" onClick={closeSidebar}>
                Post
              </NavLink>
              <Link to="/my-postings" className="sidebar__menu-item sidebar__link" onClick={closeSidebar}>
                My postings
              </Link>
              <button type="button" className="sidebar__link sidebar__link--btn sign-out" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          )}
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
