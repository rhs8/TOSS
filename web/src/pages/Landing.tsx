import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="container">
      <section style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <h1 style={{ fontSize: "2.5rem", color: "var(--toss-green)" }}>Toss</h1>
        <p style={{ fontSize: "1.125rem", maxWidth: 600, margin: "0 auto 1rem" }}>
          A money-free community exchange. Post an item to unlock browsing. 1 post = 1 borrow. Items circulate — never back to the same person.
        </p>
        <p style={{ opacity: 0.8 }}>
          Institution email (e.g. @sfu.ca). 3-month commitment. Card on file for accountability — only charged if you don’t pass an item on.
        </p>
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/signup" className="btn">Sign up</Link>
          <Link to="/signin" className="btn" style={{ background: "var(--toss-mint)", color: "var(--toss-green)" }}>Sign in</Link>
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
        <div className="card">
          <h3 style={{ color: "var(--toss-green)" }}>Post first</h3>
          <p style={{ fontSize: "0.9rem", margin: 0 }}>You must post at least one item before you can browse or request anything.</p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--toss-green)" }}>1 post = 1 borrow</h3>
          <p style={{ fontSize: "0.9rem", margin: 0 }}>Receive as many items as you’ve posted. Post more to borrow more.</p>
        </div>
        <div className="card">
          <h3 style={{ color: "var(--toss-green)" }}>Item biography</h3>
          <p style={{ fontSize: "0.9rem", margin: 0 }}>Every item has a history of who held it. Items circulate through the community.</p>
        </div>
      </section>
    </div>
  );
}
