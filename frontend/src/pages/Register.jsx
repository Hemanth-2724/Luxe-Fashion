import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", gender: "", address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (user) return <Navigate to="/products" replace />;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGenderIcon = (val) => {
    if (val === "Female") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6"></circle><line x1="12" y1="16" x2="12" y2="22"></line><line x1="9" y1="19" x2="15" y2="19"></line></svg>;
    if (val === "Male")   return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"></circle><line x1="14.24" y1="9.76" x2="20" y2="4"></line><line x1="16" y1="4" x2="20" y2="4"></line><line x1="20" y1="8" x2="20" y2="4"></line></svg>;
    if (val === "Other")  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="8" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="16"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="16" y2="12"></line></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);

    const { confirmPassword, ...payload } = form;
    const formData = new URLSearchParams(payload);

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      if (text.includes("SUCCESS") || text.includes("Successful")) {
        addToast("Account created! Please sign in.", "success");
        navigate("/login");
      } else {
        setError(text.replace("Registration Failed ❌ -> ", ""));
      }
    } catch {
      setError("Cannot reach server. Is Tomcat running?");
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: "", label: "Prefer not to say" },
    { value: "Female", label: "Female" },
    { value: "Male",   label: "Male" },
    { value: "Other",  label: "Other" },
  ];

  return (
    <div className="auth-page">
      <style>{`
        @keyframes dropdownScale {
          0%   { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @media (max-width: 768px) {
          .auth-card { padding: 1.5rem; margin: 1rem; width: calc(100% - 2rem); }
          .profile-grid { display: flex; flex-direction: column; gap: 1rem; }
        }
      `}</style>
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">LUXE</div>
        <p className="auth-tagline">Join the world of curated fashion</p>

        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" className="form-input" name="fullName" placeholder="Jane Doe" required value={form.fullName} onChange={handleChange} autoComplete="name" />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="reg-phone">Phone</label>
              <input id="reg-phone" className="form-input" name="phone" placeholder="+91 9999999999" value={form.phone} onChange={handleChange} autoComplete="tel" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" className="form-input" type="email" name="email" placeholder="your@email.com" required value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className="profile-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: "relative" }}>
                <input id="reg-password" className="form-input" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" required value={form.password} onChange={handleChange} autoComplete="new-password" style={{ paddingRight: "2.5rem" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}>
                  {showPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" className="form-input" type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" required value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </div>
          </div>

          {/* Gender dropdown */}
          <div className="form-field" style={{ position: "relative", zIndex: 50 }}>
            <label className="form-label">Gender</label>
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ marginTop: "0.5rem", padding: "1rem 1.2rem", borderRadius: "10px", border: isDropdownOpen ? "2px solid var(--rose)" : "2px solid var(--border)", backgroundColor: "var(--bg-1)", color: "var(--text-1)", fontSize: "1rem", cursor: "pointer", width: "100%", outline: "none", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "1rem", fontWeight: 500 }}
              >
                <span style={{ display: "flex", alignItems: "center", color: "var(--rose)" }}>{getGenderIcon(form.gender)}</span>
                <span style={{ flex: 1 }}>{form.gender || "Prefer not to say"}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s ease", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-3)" }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              {isDropdownOpen && (
                <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "0.8rem", padding: "0.5rem", backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "0 16px 40px rgba(0,0,0,0.2)", listStyle: "none", zIndex: 1000, display: "flex", flexDirection: "column", gap: "0.3rem", animation: "dropdownScale 0.2s ease-out forwards", transformOrigin: "top center" }}>
                  {genderOptions.map((option, idx) => {
                    const isSelected = option.value === form.gender;
                    return (
                      <li
                        key={idx}
                        onClick={() => { setForm({ ...form, gender: option.value }); setIsDropdownOpen(false); }}
                        style={{ padding: "0.8rem 1rem", cursor: "pointer", color: isSelected ? "var(--rose)" : "var(--text-1)", backgroundColor: isSelected ? "var(--bg-3)" : "transparent", fontSize: "0.95rem", fontWeight: isSelected ? "600" : "500", display: "flex", alignItems: "center", gap: "1rem", borderRadius: "8px", transition: "all 0.2s ease" }}
                        onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.backgroundColor = "var(--bg-3)"; e.currentTarget.style.transform = "translateX(4px)"; } }}
                        onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.transform = "translateX(0)"; } }}
                      >
                        <span style={{ display: "flex", alignItems: "center", color: isSelected ? "var(--rose)" : "var(--text-2)" }}>{getGenderIcon(option.value)}</span>
                        <span>{option.label}</span>
                        {isSelected && <span style={{ marginLeft: "auto", color: "var(--rose)", fontSize: "1.2rem" }}>✓</span>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-address">Shipping Address</label>
            <textarea id="reg-address" className="form-textarea" name="address" placeholder="Your full address…" required value={form.address} onChange={handleChange} autoComplete="street-address" />
          </div>

          <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <p style={{ textAlign: "center", color: "var(--text-2)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}