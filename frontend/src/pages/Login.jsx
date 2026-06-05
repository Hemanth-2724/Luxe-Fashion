import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

export default function Login() {
  // Hooks must be called before conditional returns
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const navigate                = useNavigate();
  const { login, user }         = useAuth();
  const { addToast }            = useToast();

  // Already logged in → go to products
  if (user) return <Navigate to="/products" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login({ userId: data.userId, fullName: data.fullName, email: data.email });
        addToast(`Welcome back, ${data.fullName}!`, "success");
        navigate("/products");
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Cannot reach server. Is Tomcat running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <style>{`
        @media (max-width: 768px) {
          .auth-card { padding: 1.5rem; margin: 1rem; width: calc(100% - 2rem); }
        }
      `}</style>
      <div className="auth-card">
        <div className="auth-logo">LUXE</div>
        <p className="auth-tagline">Curated fashion for the discerning</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              name="email"
              className="form-input"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                name="password"
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold btn-full"
            disabled={loading}
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: "center", color: "var(--text-2)", fontSize: "0.9rem" }}>
          New to Luxe?{" "}
          <Link to="/register" className="auth-link">Create an account</Link>
        </p>

        {/* Back to browsing */}
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/products" style={{ fontSize: "0.82rem", color: "var(--text-3)", textDecoration: "none" }}>
            ← Continue browsing without signing in
          </Link>
        </p>

        {/* Admin Login Link */}
        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/admin/login" style={{ fontSize: "0.82rem", color: "var(--text-3)", textDecoration: "underline" }}>
            Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}