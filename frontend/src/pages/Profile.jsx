import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BASE_URL from "../api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.fullName || "User",
    email: user?.email || "user@example.com",
    phone: "",
    address: "",
    gender: ""
  });
  useEffect(() => {
    fetch(`${BASE_URL}/profile`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setFormData({
          name: data.fullName || user?.fullName || "User",
          email: data.email || user?.email || "user@example.com",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "" // Retaining gender so we don't accidentally overwrite it with null
        });
      })
      .catch(err => console.error("Error fetching profile", err));

    // Fetch user orders to display the total count
    fetch(`${BASE_URL}/checkout`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setTotalOrders(data.length);
      })
      .catch(err => console.error("Error fetching orders", err));
  }, [user]);

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
    if (val === "Male") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"></circle><line x1="14.24" y1="9.76" x2="20" y2="4"></line><line x1="16" y1="4" x2="20" y2="4"></line><line x1="20" y1="8" x2="20" y2="4"></line></svg>;
    if (val === "Other") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="8" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="16"></line><line x1="8" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="16" y2="12"></line></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    const payload = new URLSearchParams();
    payload.append("fullName", formData.name);
    payload.append("phone", formData.phone);
    payload.append("address", formData.address);
    payload.append("gender", formData.gender);

    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "POST",
        body: payload,
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEditing(false);
        addToast("Profile updated successfully!", "success");
      } else {
        addToast(data.error || "Failed to update profile", "error");
      }
    } catch (error) {
      addToast("Network error while updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") await logout();
    } catch (error) {
      console.error("Logout error", error);
    }
    addToast("You have successfully signed out.", "success");
    navigate("/", { replace: true });
  };

  return (
    <div className="page-wrapper fade-in">
      <style>{`
        @keyframes dropdownScale {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 768px) {
          .profile-layout { display: flex; flex-direction: column; gap: 2rem; }
          .profile-sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); padding-bottom: 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
          .profile-form-card { width: 100%; max-width: 450px; margin: 0 auto; }
          .profile-form-card .btn { flex: 1; justify-content: center; }
          .profile-grid { display: flex; flex-direction: column; gap: 1rem; }
          .profile-stat { width: 100%; max-width: 300px; margin-left: auto; margin-right: auto; }
          .profile-sidebar > div:last-child { width: 100%; max-width: 300px; margin-left: auto; margin-right: auto; }
        }
      `}</style>
      <div className="breadcrumb">
        <Link to="/products">Home</Link> <span className="breadcrumb-sep">/</span> <span>Profile</span>
      </div>
      
      <div className="profile-layout">
        <div className="profile-sidebar" style={{ animation: "fadeIn 0.6s ease-out" }}>
          <div className="profile-avatar-wrap" style={{ transform: "scale(1.05)", transition: "transform 0.3s ease" }}>
            <div className="profile-avatar-ring"></div>
            <div className="profile-avatar">
              {formData.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="profile-name" style={{ marginTop: '1rem' }}>{formData.name}</h2>
          <p className="profile-email" style={{ color: 'var(--text-2)' }}>{formData.email}</p>
          
          <div className="profile-stat" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
            <div className="profile-stat-num" style={{ fontSize: '2.5rem', color: 'var(--rose)', fontStyle: 'normal', fontVariantNumeric: 'tabular-nums' }}>{Number(totalOrders).toLocaleString()}</div>
            <div className="profile-stat-label">Total Orders</div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-danger btn-full" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        <div className="profile-form-card" style={{ animation: "fadeIn 0.8s ease-out" }}>
          <h3 className="profile-section-title">
            <span className="dot" style={{ background: 'var(--rose)' }}></span> Profile Information
          </h3>
          
          <div className="profile-grid">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} readOnly={!isEditing} style={{ opacity: isEditing ? 1 : 0.8 }} />
            </div>
            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} readOnly={!isEditing} style={{ opacity: isEditing ? 1 : 0.8 }} />
            </div>
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} readOnly={!isEditing} style={{ opacity: isEditing ? 1 : 0.8 }} />
            </div>
            <div className="form-field" style={{ position: 'relative', zIndex: 50 }}>
              <label className="form-label">Gender</label>
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div 
                  onClick={() => isEditing && setIsDropdownOpen(!isDropdownOpen)}
                  style={{ marginTop: '0.5rem', padding: '1rem 1.2rem', borderRadius: '10px', border: isDropdownOpen ? '2px solid var(--rose)' : '2px solid var(--border)', backgroundColor: 'var(--bg-1)', color: 'var(--text-1)', fontSize: '1rem', cursor: isEditing ? 'pointer' : 'not-allowed', width: '100%', outline: 'none', transition: 'all 0.2s ease', boxShadow: isDropdownOpen ? '0 4px 12px rgba(225, 29, 72, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 500, opacity: isEditing ? 1 : 0.8 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--rose)' }}>{getGenderIcon(formData.gender)}</span>
                  <span style={{ flex: 1 }}>{formData.gender || "Prefer not to say"}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.3s ease', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-3)' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                
                {isDropdownOpen && isEditing && (
                  <ul style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.8rem', padding: '0.5rem', backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 16px 40px rgba(0,0,0,0.2)', listStyle: 'none', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.3rem', animation: 'dropdownScale 0.2s ease-out forwards', transformOrigin: 'top center'
                  }}>
                    {[{value: "", label: "Prefer not to say"}, {value: "Female", label: "Female"}, {value: "Male", label: "Male"}, {value: "Other", label: "Other"}].map((option, idx) => {
                      const isSelected = option.value === formData.gender;
                      
                      return (
                        <li 
                          key={idx} 
                          onClick={() => { setFormData({ ...formData, gender: option.value }); setIsDropdownOpen(false); }}
                          style={{ padding: '0.8rem 1rem', cursor: 'pointer', color: isSelected ? 'var(--rose)' : 'var(--text-1)', backgroundColor: isSelected ? 'var(--bg-3)' : 'transparent', fontSize: '0.95rem', fontWeight: isSelected ? '600' : '500', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'var(--bg-3)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', color: isSelected ? 'var(--rose)' : 'var(--text-2)' }}>{getGenderIcon(option.value)}</span>
                          <span>{option.label}</span>
                          {isSelected && <span style={{ marginLeft: 'auto', color: 'var(--rose)', fontSize: '1.2rem' }}>✓</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Shipping Address</label>
              <textarea name="address" className="form-textarea" value={formData.address} onChange={handleChange} readOnly={!isEditing} style={{ opacity: isEditing ? 1 : 0.8, resize: 'vertical' }} />
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            {isEditing ? (
              <>
                <button className="btn btn-rose" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-ghost" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}