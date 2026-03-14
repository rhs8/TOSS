import { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { api } from "./api";

const FALLBACK_CATEGORIES: { id: string; name: string; slug: string }[] = [
  { id: "1", name: "Board games", slug: "board-games" },
  { id: "2", name: "Books", slug: "books" },
  { id: "3", name: "Clothes & accessories", slug: "clothes-accessories" },
  { id: "4", name: "Cleaning machines", slug: "cleaning-machines" },
  { id: "5", name: "Maintenance devices", slug: "maintenance-devices" },
  { id: "6", name: "Moving boxes", slug: "moving-boxes" },
  { id: "7", name: "Costumes (Halloween & more)", slug: "costumes" },
  { id: "8", name: "House decorations", slug: "house-decorations" },
  { id: "9", name: "Furniture", slug: "furniture" },
  { id: "10", name: "Kitchen", slug: "kitchen" },
  { id: "11", name: "Tools", slug: "tools" },
  { id: "12", name: "Electronics", slug: "electronics" },
  { id: "13", name: "Sports", slug: "sports" },
  { id: "14", name: "Other", slug: "other" },
];

export default function Layout() {
  const { user, setToken } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>(FALLBACK_CATEGORIES);
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get("category") ?? "";

  useEffect(() => {
    api.getCategories().then((d) => setCategories(d.categories || FALLBACK_CATEGORIES)).catch(() => {});
  }, []);

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
          <button
            type="button"
            className="sidebar__menu-item"
            onClick={() => setCategoriesOpen((o) => !o)}
            aria-expanded={categoriesOpen}
          >
            Categories {categoriesOpen ? "▾" : "▸"}
          </button>
          {categoriesOpen && (
            <ul className="sidebar__sublist">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/browse?category=${encodeURIComponent(c.slug)}`}
                    className={`sidebar__sublist-link ${currentCategory === c.slug ? "active" : ""}`}
                    onClick={closeSidebar}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

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
