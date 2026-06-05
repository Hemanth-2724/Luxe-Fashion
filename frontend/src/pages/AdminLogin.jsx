import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import BASE_URL from "../api";

export default function AdminLogin() {
  const { admin, loginAdmin } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new URLSearchParams();
    fd.append("email", email);
    fd.append("password", password);

    try {
      const res  = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST", body: fd, credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loginAdmin({
          adminId:       data.adminId,
          fullName:      data.fullName,
          email:         data.email,
          categoryScope: data.categoryScope,
        });
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch {
      setError("Cannot reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "0.3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 56, height: 56, borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(232,180,160,0.15), rgba(126,205,200,0.1))",
            border: "1.5px solid rgba(232,180,160,0.3)", marginBottom: "0.8rem",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="auth-logo" style={{ fontSize: "1.6rem" }}>Admin Portal</div>
          <p className="auth-tagline">Luxe Fashion Management</p>
        </div>

        {error && (
          <div className="alert alert-error"><span>⚠</span> {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Admin Email</label>
            <input
              className="form-input" type="email" placeholder="admin@luxe.com"
              required value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{ position:"absolute", right:"0.8rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", display:"flex" }}
              >
                {showPw
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <button className="btn btn-rose btn-full" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Signing in…" : "Sign In as Admin"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign:"center", color:"var(--text-2)", fontSize:"0.85rem" }}>
          Not an admin?{" "}
          <Link to="/login" className="auth-link">Go to user login →</Link>
        </p>

      </div>
    </div>
  );
}