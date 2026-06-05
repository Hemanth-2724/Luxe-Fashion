import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer style={{ position: "relative", background: "var(--bg-2)", borderTop: "1px solid var(--border)", overflow: "hidden", zIndex: 1 }}>

      {/* ── Ambient top glow ── */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70vw", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,180,160,0.35), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -120, left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,180,160,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -80, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(126,205,200,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />

      <style>{`
        .footer-link {
          color: var(--text-3);
          text-decoration: none;
          font-size: 0.84rem;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s, transform 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.15rem 0;
        }
        .footer-link:hover { color: var(--rose); transform: translateX(3px); }

        .footer-social {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-3);
          text-decoration: none;
          transition: all 0.25s;
          cursor: pointer;
        }
        .footer-social:hover {
          border-color: rgba(232,180,160,0.4);
          background: var(--rose-dim);
          color: var(--rose);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(232,180,160,0.15);
        }

        .footer-col-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.04em;
          margin-bottom: 1.1rem;
          position: relative;
          display: inline-block;
        }
        .footer-col-title::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 24px; height: 1px;
          background: var(--rose);
        }

        .footer-newsletter-input {
          flex: 1;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 10px 0 0 10px;
          padding: 0.72rem 1rem;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          outline: none;
          min-width: 0;
          transition: border-color 0.2s;
        }
        .footer-newsletter-input::placeholder { color: var(--text-3); }
        .footer-newsletter-input:focus { border-color: rgba(232,180,160,0.4); }

        .footer-newsletter-btn {
          padding: 0.72rem 1.2rem;
          background: var(--rose);
          color: #0a0a0b;
          border: none;
          border-radius: 0 10px 10px 0;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.04em;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .footer-newsletter-btn:hover {
          background: var(--rose-light);
          box-shadow: 0 4px 16px rgba(232,180,160,0.35);
        }

        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          font-size: 0.72rem;
          color: var(--text-3);
          font-family: 'Outfit', sans-serif;
        }
        .footer-badge svg { color: var(--rose); }

        .footer-bottom-link {
          color: var(--text-3);
          text-decoration: none;
          font-size: 0.75rem;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s;
        }
        .footer-bottom-link:hover { color: var(--rose); }

        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem 2rem !important; }
          .footer-brand-col { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-brand-col { grid-column: auto; }
          .footer-bottom-row { flex-direction: column !important; gap: 0.75rem !important; text-align: center; }
          .footer-bottom-links { justify-content: center !important; }
        }
      `}</style>

      {/* ── Main grid ── */}
      <div style={{ maxWidth: 1260, margin: "0 auto", padding: "4rem 2rem 2.5rem" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: "2rem 3rem", marginBottom: "3.5rem" }}>

          {/* ── Brand column ── */}
          <div className="footer-brand-col">
            <Link to="/products" style={{ display: "inline-block", textDecoration: "none", marginBottom: "1.2rem" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--rose)", letterSpacing: "0.1em", lineHeight: 1 }}>
                LUXE <span style={{ color: "var(--text)", fontWeight: 300, opacity: 0.85 }}>FASHION</span>
              </div>
            </Link>
            <p style={{ fontSize: "0.84rem", color: "var(--text-3)", lineHeight: 1.75, maxWidth: 280, marginBottom: "1.5rem", fontFamily: "'Outfit', sans-serif" }}>
              Curated fashion for the discerning. We bring together the finest styles from around the world — timeless pieces for every occasion.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.8rem" }}>
              {[
                { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: "Free Shipping ₹1999+" },
                { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>, label: "30-Day Returns" },
                { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "Secure Payments" },
              ].map(({ icon, label }) => (
                <span key={label} className="footer-badge">{icon}{label}</span>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { label: "Instagram", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                { label: "Pinterest", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.23-5.22 1.23-5.22s-.31-.63-.31-1.57c0-1.47.85-2.57 1.91-2.57.9 0 1.34.68 1.34 1.49 0 .91-.58 2.27-.88 3.53-.25 1.06.53 1.92 1.57 1.92 1.88 0 3.14-2.4 3.14-5.24 0-2.16-1.46-3.77-4.1-3.77-2.99 0-4.84 2.23-4.84 4.71 0 .85.25 1.45.64 1.91.18.21.2.3.14.54-.05.17-.15.58-.19.74-.06.24-.25.33-.46.24-1.3-.53-1.9-1.97-1.9-3.58 0-2.65 2.23-5.82 6.66-5.82 3.57 0 5.93 2.59 5.93 5.37 0 3.67-2.04 6.41-5.04 6.41-1.01 0-1.96-.54-2.28-1.16l-.63 2.41c-.21.79-.62 1.58-.99 2.19.85.26 1.75.4 2.67.4 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg> },
                { label: "Twitter / X", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label: "Facebook", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
              ].map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label} className="footer-social">{icon}</a>
              ))}
            </div>
          </div>

          {/* ── Shop column ── */}
          <div>
            <div className="footer-col-title">Shop</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {[
                { to: "/categories?gender=Women", label: "Women" },
                { to: "/categories?gender=Men", label: "Men" },
                { to: "/categories?gender=Kids", label: "Kids" },
                { to: "/categories?gender=Accessories", label: "Accessories" },
                { to: "/categories?disc=20", label: "Sale" },
                { to: "/categories", label: "New Arrivals" },
              ].map(({ to, label }) => (
                <Link key={label} to={to} className="footer-link">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Account column ── */}
          <div>
            <div className="footer-col-title">Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {[
                ...(!user ? [
                  { to: "/login",    label: "Sign In" },
                  { to: "/register", label: "Create Account" },
                ] : [
                  { to: "/profile",  label: "My Profile" },
                  { to: "/orders",   label: "My Orders" },
                  { to: "/cart",     label: "My Cart" },
                ]),
                { to: "/products",   label: "Collections" },
                { to: "/categories", label: "Categories" },
              ].map(({ to, label }) => (
                <Link key={label} to={to} className="footer-link">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Help column ── */}
          <div>
            <div className="footer-col-title">Help</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", marginBottom: "1.8rem" }}>
              {[
                { label: "Size Guide" },
                { label: "Shipping Info" },
                { label: "Returns & Exchanges" },
                { label: "Track Your Order" },
                { label: "Contact Us" },
                { label: "FAQs" },
              ].map(({ label }) => (
                <a key={label} href="#" className="footer-link">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  {label}
                </a>
              ))}
              <Link to="/admin/login" className="footer-link">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                Admin Portal
              </Link>
            </div>

            {/* Contact snippet */}
            <div style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Need help?</div>
              <a href="mailto:hello@luxefashion.com" style={{ color: "var(--rose)", fontSize: "0.82rem", textDecoration: "none", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                hello@luxefashion.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Newsletter strip ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(232,180,160,0.06) 0%, rgba(126,205,200,0.04) 100%)",
          border: "1px solid rgba(232,180,160,0.14)",
          borderRadius: "16px",
          padding: "1.8rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "3rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -30, top: "50%", transform: "translateY(-50%)", fontSize: "6rem", opacity: 0.04, pointerEvents: "none", userSelect: "none", fontFamily: "'Cormorant Garamond', serif" }}>✦</div>
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.25rem" }}>
              Stay in the loop
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", fontFamily: "'Outfit', sans-serif" }}>
              New arrivals, exclusive offers & style inspiration — straight to your inbox.
            </p>
          </div>
          {subscribed ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "var(--success)", fontSize: "0.88rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              You're subscribed!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", minWidth: 0, flex: "0 0 auto", maxWidth: 380, width: "100%" }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="footer-newsletter-input"
              />
              <button type="submit" className="footer-newsletter-btn">Subscribe</button>
            </form>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)", marginBottom: "1.5rem" }} />

        {/* ── Bottom bar ── */}
        <div className="footer-bottom-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-3)", fontFamily: "'Outfit', sans-serif" }}>
            © {year} <span style={{ color: "var(--rose)" }}>Luxe Fashion</span>. All rights reserved.
          </div>

          <div className="footer-bottom-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map(label => (
              <a key={label} href="#" className="footer-bottom-link">{label}</a>
            ))}
          </div>

          {/* Payment badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {[
              { label: "Visa",       bg: "#1a1f71", color: "#fff",    text: "VISA" },
              { label: "Mastercard", bg: "#252525", color: "#f79e1b", text: "MC" },
              { label: "UPI",        bg: "#4a2c8f", color: "#fff",    text: "UPI" },
              { label: "COD",        bg: "#1a2e1a", color: "#70c8a0", text: "COD" },
            ].map(({ label, bg, color, text }) => (
              <span key={label} style={{ background: bg, color, fontSize: "0.6rem", fontWeight: 800, padding: "0.2rem 0.5rem", borderRadius: "4px", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.05em", border: "1px solid rgba(255,255,255,0.06)" }}>
                {text}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}