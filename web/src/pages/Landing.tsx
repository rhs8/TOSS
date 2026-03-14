import { Link } from "react-router-dom";

const SAMPLE_BIO_CARDS = [
  {
    id: "1",
    name: "Vintage lamp",
    icon: "💡",
    firstInCirculation: "Nov 2024",
    exchanges: 4,
    history: [
      { holder: "Jordan", from: "Nov 2024", to: "Dec 2024" },
      { holder: "Sam", from: "Dec 2024", to: "Jan 2025" },
      { holder: "Casey", from: "Jan 2025", to: "Feb 2025" },
      { holder: "Alex", from: "Feb 2025", to: "Current" },
    ],
  },
  {
    id: "2",
    name: "Board game",
    icon: "🎲",
    firstInCirculation: "Oct 2024",
    exchanges: 5,
    history: [
      { holder: "Riley", from: "Oct 2024", to: "Nov 2024" },
      { holder: "Morgan", from: "Nov 2024", to: "Jan 2025" },
      { holder: "Quinn", from: "Jan 2025", to: "Current" },
    ],
  },
  {
    id: "3",
    name: "Stand mixer",
    icon: "🥣",
    firstInCirculation: "Jan 2025",
    exchanges: 2,
    history: [
      { holder: "Taylor", from: "Jan 2025", to: "Feb 2025" },
      { holder: "Jamie", from: "Feb 2025", to: "Current" },
    ],
  },
  {
    id: "4",
    name: "Camping tent",
    icon: "⛺",
    firstInCirculation: "Sep 2024",
    exchanges: 4,
    history: [
      { holder: "Avery", from: "Sep 2024", to: "Nov 2024" },
      { holder: "Reese", from: "Nov 2024", to: "Jan 2025" },
      { holder: "Drew", from: "Jan 2025", to: "Current" },
    ],
  },
  {
    id: "5",
    name: "Books bundle",
    icon: "📚",
    firstInCirculation: "Dec 2024",
    exchanges: 4,
    history: [
      { holder: "Sky", from: "Dec 2024", to: "Jan 2025" },
      { holder: "River", from: "Jan 2025", to: "Feb 2025" },
      { holder: "Parker", from: "Feb 2025", to: "Current" },
    ],
  },
  {
    id: "6",
    name: "Toolbox",
    icon: "🔧",
    firstInCirculation: "Nov 2024",
    exchanges: 3,
    history: [
      { holder: "Cameron", from: "Nov 2024", to: "Dec 2024" },
      { holder: "Finley", from: "Dec 2024", to: "Feb 2025" },
      { holder: "Robin", from: "Feb 2025", to: "Current" },
    ],
  },
];

function BioCardsScroll() {
  return (
    <div className="bio-cards" aria-label="Sample items in the exchange">
      <div className="bio-cards__scroll">
        {SAMPLE_BIO_CARDS.map((item) => (
          <div key={item.id} className="bio-card bio-card--employee">
            <div className="bio-card__image">
              <span className="bio-card__icon" aria-hidden>{item.icon}</span>
            </div>
            <div className="bio-card__body">
              <h3 className="bio-card__name">{item.name}</h3>
              <dl className="bio-card__meta">
                <dt>First in circulation</dt>
                <dd>{item.firstInCirculation}</dd>
                <dt>Exchanges</dt>
                <dd>{item.exchanges}</dd>
              </dl>
              <div className="bio-card__history">
                <span className="bio-card__history-title">History</span>
                <ul className="bio-card__history-list">
                  {item.history.map((h, i) => (
                    <li key={i}>
                      <strong>{h.holder}</strong> {h.from} → {h.to}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowExchangeWorks() {
  const steps = [
    {
      num: 1,
      title: "Give something first.",
      text: "List an item you own but don't need right now. That's your key into the community.",
    },
    {
      num: 2,
      title: "Browse and request.",
      text: "See everything your community has shared. Request freely, you can receive as much as you give.",
    },
    {
      num: 3,
      title: "Meet and exchange.",
      text: "Arrange a handoff at a public place or use delivery. No haggling, no fees, no fuss.",
    },
    {
      num: 4,
      title: "Pass it on.",
      text: "When you're done, it doesn't go back, it goes forward. To the next person. That's the whole idea.",
    },
  ];
  return (
    <div className="how-exchange">
      <ol className="how-exchange__list">
        {steps.map((step) => (
          <li key={step.num} className="how-exchange__step">
            <span className="how-exchange__num" aria-hidden>{step.num}</span>
            <div className="how-exchange__content">
              <h3 className="how-exchange__title">{step.title}</h3>
              <p className="how-exchange__text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="how-exchange__note">
        Some platforms charge fees. Some platforms charge time. TOSS just asks you to give before you receive. Less buying. Less waste. More community and at least one exchange per month to keep the cycle going.
      </p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing landing--minimal">
      <section className="landing__hero landing__hero--minimal">
        <h1 className="landing__name landing__name--big">TOSS</h1>
        <p className="landing__mission landing__mission--minimal">
          A community exchange platform for people who move around, travel light, or just arrived somewhere new. Get what you need passed along to you, pass it on when you're done. Every exchange is a purchase that didn't happen, and a little less waste in the world.
        </p>
      </section>

      <section className="landing__bio-section">
        <h2 className="landing__section-label">Items in motion</h2>
        <BioCardsScroll />
      </section>

      <section className="landing__cycle-section">
        <h2 className="landing__section-label">How the exchange works</h2>
        <HowExchangeWorks />
      </section>

      <section className="landing__cta landing__cta--minimal">
        <p className="landing__cta-text">Create an account to get started. Post an item, then browse and request what you need.</p>
        <Link to="/signup" className="btn btn--minimal">Create account</Link>
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", opacity: 0.9 }}>Already have an account? <Link to="/signin">Sign in</Link></p>
      </section>
    </div>
  );
}
