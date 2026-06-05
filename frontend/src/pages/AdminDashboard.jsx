import { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import BASE_URL from "../api";

function CustomDropdown({ value, options, onChange, style }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: isOpen ? "2px solid var(--rose)" : "1px solid var(--border)", backgroundColor: "var(--bg-3)", color: "var(--text)", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 500, transition: "all 0.2s" }}
      >
        <span>{value}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none", color: "var(--text-3)" }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {isOpen && (
        <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "0.5rem", padding: "0.4rem", backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", listStyle: "none", zIndex: 1000, display: "flex", flexDirection: "column", gap: "0.2rem", animation: "dropdownScale 0.2s ease-out forwards", transformOrigin: "top center" }}>
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <li
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                style={{ padding: "0.6rem 0.8rem", cursor: "pointer", color: isSelected ? "var(--rose)" : "var(--text-1)", backgroundColor: isSelected ? "var(--bg-3)" : "transparent", fontSize: "0.85rem", fontWeight: isSelected ? "600" : "500", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-3)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {opt}
                {isSelected && <span style={{ color: "var(--rose)", fontSize: "1rem" }}>✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const STATUS_OPTIONS = ["Placed", "Shipped", "Delivered", "Cancelled"];
const STATUS_COLORS = {
  Placed:    { bg: "rgba(232,180,160,0.12)", color: "var(--rose)" },
  Shipped:   { bg: "rgba(126,205,200,0.12)", color: "var(--teal)" },
  Delivered: { bg: "rgba(112,200,160,0.12)", color: "var(--success)" },
  Cancelled: { bg: "rgba(224,112,112,0.12)", color: "var(--danger)" },
  Pending:   { bg: "rgba(138,135,154,0.12)", color: "var(--text-2)" },
};

export default function AdminDashboard() {
  const { admin, logoutAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats]         = useState({});
  const [orders, setOrders]       = useState([]);
  const [products, setProducts]   = useState([]);
  const [loadingOrders, setLO]    = useState(false);
  const [loadingProds,  setLP]    = useState(false);
  const [orderSearch,   setOS]    = useState("");
  const [orderFilter,   setOF]    = useState("All");
  const [productSearch, setPS]    = useState("");
  const [showProductModal, setSPM] = useState(false);
  const [editingProduct,   setEP]  = useState(null); // null = add new
  const [savingProduct,    setSavP] = useState(false);
  const [productForm, setPF] = useState({
    productName: "", description: "", price: "", discountPercent: "0",
    imageUrl: "", genderCategory: "",
  });
  const [toast, setToast] = useState(null);

  if (!admin) return <Navigate to="/admin/login" replace />;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── FETCH STATS ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/admin/dashboard`, { credentials: "include" })
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  // ── FETCH ORDERS ─────────────────────────────────────────
  const fetchOrders = useCallback(() => {
    setLO(true);
    fetch(`${BASE_URL}/admin/orders`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLO(false));
  }, []);

  // ── FETCH PRODUCTS ────────────────────────────────────────
  const fetchProducts = useCallback(() => {
    setLP(true);
    fetch(`${BASE_URL}/admin/products`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLP(false));
  }, []);

  useEffect(() => {
    if (activeTab === "orders")   fetchOrders();
    if (activeTab === "products") fetchProducts();
  }, [activeTab]);

  // ── UPDATE ORDER STATUS ───────────────────────────────────
  const updateStatus = async (orderId, newStatus) => {
    const fd = new URLSearchParams();
    fd.append("orderId", orderId);
    fd.append("status",  newStatus);
    const res = await fetch(`${BASE_URL}/admin/orders`, {
      method: "POST", body: fd, credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o =>
        o.orderId === orderId ? { ...o, orderStatus: newStatus } : o
      ));
      showToast(`Order #${orderId} → ${newStatus}`);
    } else {
      showToast("Update failed", "error");
    }
  };

  // ── PRODUCT FORM ──────────────────────────────────────────
  const openAdd = () => {
    setEP(null);
    setPF({ productName:"", description:"", price:"", discountPercent:"0", imageUrl:"", genderCategory: admin.categoryScope === "All" ? "Men" : admin.categoryScope });
    setSPM(true);
  };

  const openEdit = (p) => {
    setEP(p);
    setPF({
      productName:     p.productName || "",
      description:     p.description || "",
      price:           String(p.price || ""),
      discountPercent: String(p.discountPercent || 0),
      imageUrl:        p.imageUrl || "",
      genderCategory:  p.genderCategory || "",
    });
    setSPM(true);
  };

  const saveProduct = async () => {
    if (!productForm.productName || !productForm.price) {
      showToast("Name and price are required", "error"); return;
    }
    setSavP(true);
    const fd = new URLSearchParams({ ...productForm });
    if (editingProduct) {
      fd.append("_method",   "PUT");
      fd.append("productId", editingProduct.productId);
    }

    const res  = await fetch(`${BASE_URL}/admin/products`, {
      method: "POST", body: fd, credentials: "include",
    });
    const data = await res.json();
    setSavP(false);
    if (data.success) {
      showToast(editingProduct ? "Product updated!" : "Product added!");
      setSPM(false);
      fetchProducts();
    } else {
      showToast(data.error || "Failed to save product", "error");
    }
  };

  const deleteProduct = async (productId, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const fd = new URLSearchParams({ _method:"DELETE", id: productId });
    const res  = await fetch(`${BASE_URL}/admin/products`, {
      method: "POST", body: fd, credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setProducts(prev => prev.filter(p => p.productId !== productId));
      showToast("Product deleted");
    } else {
      showToast("Delete failed", "error");
    }
  };

  // ── FILTERED DATA ─────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearch || (
      (o.customerName  || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      String(o.orderId).includes(orderSearch)
    );
    const matchFilter = orderFilter === "All" || o.orderStatus === orderFilter;
    return matchSearch && matchFilter;
  });

  const filteredProducts = products.filter(p =>
    !productSearch ||
    (p.productName || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const scopeColor = {
    All: "var(--rose)", Men: "var(--teal)", Women: "#c084fc",
    Kids: "#fbbf24", Accessories: "#34d399",
  }[admin.categoryScope] || "var(--rose)";

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      <style>{`
        .admin-sidebar-link { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 1rem; border-radius:10px; color:var(--text-2); text-decoration:none; font-size:0.88rem; font-weight:500; cursor:pointer; background:none; border:none; width:100%; transition:all 0.2s; font-family:'Outfit',sans-serif; }
        .admin-sidebar-link:hover, .admin-sidebar-link.active { background:rgba(232,180,160,0.1); color:var(--rose); }
        .admin-stat-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.5rem; transition:border-color 0.2s,box-shadow 0.2s; }
        .admin-stat-card:hover { border-color:rgba(232,180,160,0.25); box-shadow:0 8px 30px rgba(0,0,0,0.3); }
        .status-select { background:var(--bg-3); border:1px solid var(--border); border-radius:8px; padding:0.4rem 0.6rem; color:var(--text); font-family:'Outfit',sans-serif; font-size:0.8rem; cursor:pointer; outline:none; transition:border-color 0.2s; }
        .status-select:focus { border-color:var(--rose); }
        @keyframes toastSlide { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dropdownScale { 0% { opacity: 0; transform: scale(0.95) translateY(-10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        
        .table-wrapper { overflow: visible; }
        @media(max-width:900px) {
          .admin-sidebar { width: 72px !important; padding: 1.5rem 0.5rem !important; }
          .admin-main { margin-left: 72px !important; padding: 1.2rem !important; }
          .hide-on-mobile { display: none !important; }
          .admin-sidebar-link { justify-content: center; padding: 0.75rem 0; }
          .admin-sidebar-link span:last-child { display: none; }
          .admin-brand { font-size: 1.1rem !important; text-align: center; }
          .table-wrapper { overflow-x: auto; }
          .admin-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important; }
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" style={{ width:220, flexShrink:0, background:"var(--bg-2)", borderRight:"1px solid var(--border)", position:"fixed", top:0, left:0, height:"100vh", display:"flex", flexDirection:"column", padding:"1.5rem 0.75rem", zIndex:100, overflowY:"auto", overflowX:"hidden" }}>
        {/* Brand */}
        <div style={{ marginBottom:"2rem", display:"block", padding:"0 0.5rem", textAlign:"center" }}>
          <div className="admin-brand" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontWeight:700, color:"var(--rose)", letterSpacing:"0.1em", lineHeight:1 }}>LUXE</div>
          <div className="hide-on-mobile" style={{ fontSize:"0.65rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.15em", marginTop:4 }}>Admin Panel</div>
        </div>

        {/* Scope badge */}
        <div className="hide-on-mobile" style={{ padding:"0.5rem 0.75rem", borderRadius:"8px", background:"rgba(232,180,160,0.06)", border:"1px solid rgba(232,180,160,0.12)", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.65rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.2rem" }}>Your Scope</div>
          <div style={{ fontSize:"0.88rem", fontWeight:700, color:scopeColor }}>{admin.categoryScope}</div>
        </div>

        {/* Nav */}
        <nav style={{ display:"flex", flexDirection:"column", gap:"0.3rem", flex:1 }}>
          {[
            { id:"overview", label:"Overview", icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
            { id:"orders",   label:"Orders",   icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { id:"products", label:"Products", icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
          ].map(tab => (
            <button key={tab.id} className={`admin-sidebar-link ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)} title={tab.label}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:"1rem" }}>
          <div className="hide-on-mobile" style={{ padding:"0 0.5rem 0.75rem", fontSize:"0.78rem", color:"var(--text-3)", lineHeight:1.6, overflow:"hidden" }}>
            <div style={{ fontWeight:600, color:"var(--text-2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{admin.fullName}</div>
            <div style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{admin.email}</div>
          </div>
          <button className="admin-sidebar-link" onClick={logoutAdmin} style={{ color:"var(--danger)" }} title="Sign Out">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main" style={{ marginLeft:220, flex:1, padding:"2rem", minWidth:0 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="fade-in">
            <div style={{ marginBottom:"2rem" }}>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:600, color:"var(--text)", marginBottom:"0.25rem" }}>
                Good day, {admin.fullName.split(" ")[0]} 👋
              </h1>
              <p style={{ color:"var(--text-2)", fontSize:"0.88rem" }}>Here's a snapshot of your {admin.categoryScope} section</p>
            </div>

            {/* Stats grid */}
            <div className="admin-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem", marginBottom:"2.5rem" }}>
              {[
                { label:"Total Products",  value: stats.totalProducts  ?? "—", icon:"🧾", color:"var(--rose)" },
                { label:"Total Orders",    value: stats.totalOrders    ?? "—", icon:"📦", color:"var(--teal)" },
                { label:"Revenue (₹)",     value: stats.totalRevenue   != null ? `₹${Number(stats.totalRevenue).toLocaleString()}` : "—", icon:"💰", color:"#fbbf24" },
                { label:"Pending Orders",  value: stats.pendingOrders  ?? "—", icon:"⏳", color:"var(--danger)" },
              ].map(s => (
                <div key={s.label} className="admin-stat-card">
                  <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:700, color:s.color, marginBottom:"0.25rem" }}>{s.value}</div>
                  <div style={{ fontSize:"0.78rem", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="admin-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
              {[
                { label:"Manage Orders",   tab:"orders",   desc:"Update shipping status, cancel orders", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                { label:"Manage Products", tab:"products", desc:"Add, edit or remove products", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
              ].map(q => (
                <div key={q.tab} onClick={() => setActiveTab(q.tab)} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"1.5rem", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(232,180,160,0.3)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; }}>
                  <div style={{ color:"var(--rose)", marginBottom:"0.75rem" }}>{q.icon}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.15rem", fontWeight:600, marginBottom:"0.3rem" }}>{q.label}</div>
                  <div style={{ fontSize:"0.8rem", color:"var(--text-3)" }}>{q.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="fade-in">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", gap:"1rem", flexWrap:"wrap" }}>
              <div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:600, color:"var(--text)", marginBottom:"0.2rem" }}>Orders</h2>
                <p style={{ color:"var(--text-2)", fontSize:"0.83rem" }}>{filteredOrders.length} orders in your scope</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>↻ Refresh</button>
            </div>

            {/* Toolbar */}
            <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.2rem", flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <svg style={{ position:"absolute", left:"0.75rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  value={orderSearch} onChange={e => setOS(e.target.value)}
                  placeholder="Search by customer or order ID…"
                  style={{ width:"100%", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", padding:"0.6rem 0.8rem 0.6rem 2.1rem", color:"var(--text)", fontFamily:"'Outfit',sans-serif", fontSize:"0.85rem", outline:"none", boxSizing:"border-box" }}
                />
              </div>
              <CustomDropdown
                value={orderFilter}
                onChange={val => setOF(val)}
                options={["All", ...STATUS_OPTIONS]}
                style={{ width: 160, zIndex: 1100 }}
              />
            </div>

            {loadingOrders ? (
              <span className="spinner" />
            ) : filteredOrders.length === 0 ? (
              <div className="empty-state"><h3>No orders found</h3></div>
            ) : (
              <div className="table-wrapper" style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 680 }}>
                  <thead>
                    <tr style={{ background:"var(--bg-3)" }}>
                      {["Order ID","Customer","Date","Total","Payment","Status","Action"].map(h => (
                        <th key={h} style={{ padding:"0.9rem 1rem", textAlign:"left", fontSize:"0.7rem", fontWeight:700, color:"var(--text-2)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(o => {
                      const st = o.orderStatus || "Pending";
                      const col = STATUS_COLORS[st] || STATUS_COLORS.Pending;
                      return (
                        <tr key={o.orderId} style={{ borderBottom:"1px solid var(--border)", transition:"background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"0.9rem 1rem", fontSize:"0.85rem", fontWeight:700, color:"var(--rose)" }}>#{o.orderId}</td>
                          <td style={{ padding:"0.9rem 1rem", fontSize:"0.85rem" }}>
                            <div style={{ fontWeight:600 }}>{o.customerName}</div>
                            <div style={{ fontSize:"0.73rem", color:"var(--text-3)" }}>{o.customerEmail}</div>
                          </td>
                          <td style={{ padding:"0.9rem 1rem", fontSize:"0.82rem", color:"var(--text-2)" }}>
                            {o.orderDate ? new Date(o.orderDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                          </td>
                          <td style={{ padding:"0.9rem 1rem", fontWeight:700, color:"var(--rose-light)" }}>₹{Number(o.totalAmount).toLocaleString()}</td>
                          <td style={{ padding:"0.9rem 1rem", fontSize:"0.82rem", color:"var(--text-2)" }}>{o.paymentMethod}</td>
                          <td style={{ padding:"0.9rem 1rem" }}>
                            <span style={{ padding:"0.25rem 0.75rem", borderRadius:"20px", fontSize:"0.72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", background:col.bg, color:col.color }}>{st}</span>
                          </td>
                          <td style={{ padding:"0.9rem 1rem" }}>
                            <CustomDropdown
                              value={st}
                              onChange={val => updateStatus(o.orderId, val)}
                              options={STATUS_OPTIONS}
                              style={{ width: 140 }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === "products" && (
          <div className="fade-in">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", gap:"1rem", flexWrap:"wrap" }}>
              <div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:600, color:"var(--text)", marginBottom:"0.2rem" }}>Products</h2>
                <p style={{ color:"var(--text-2)", fontSize:"0.83rem" }}>{filteredProducts.length} products · {admin.categoryScope} scope</p>
              </div>
              <button className="btn btn-rose btn-sm" onClick={openAdd}>+ Add Product</button>
            </div>

            {/* Search */}
            <div style={{ position:"relative", marginBottom:"1.2rem" }}>
              <svg style={{ position:"absolute", left:"0.75rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={productSearch} onChange={e => setPS(e.target.value)}
                placeholder="Search products…"
                style={{ width:"100%", maxWidth:360, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"8px", padding:"0.6rem 0.8rem 0.6rem 2.1rem", color:"var(--text)", fontFamily:"'Outfit',sans-serif", fontSize:"0.85rem", outline:"none", boxSizing:"border-box" }}
              />
            </div>

            {loadingProds ? (
              <span className="spinner" />
            ) : (
              <div className="admin-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1rem" }}>
                {filteredProducts.map(p => (
                  <div key={p.productId} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"14px", overflow:"hidden", transition:"all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(232,180,160,0.3)"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ height:160, overflow:"hidden", position:"relative" }}>
                      <img
                        src={p.imageUrl || "https://via.placeholder.com/220x160?text=No+Image"}
                        alt={p.productName}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }}
                        onError={e => { e.target.src="https://via.placeholder.com/220x160?text=No+Image"; }}
                      />
                      {p.discountPercent > 0 && (
                        <span style={{ position:"absolute", top:8, left:8, background:"var(--rose)", color:"#0a0a0b", fontSize:"0.65rem", fontWeight:800, padding:"2px 8px", borderRadius:"20px" }}>
                          -{p.discountPercent}%
                        </span>
                      )}
                      <span style={{ position:"absolute", top:8, right:8, background:"rgba(5,5,7,0.7)", color:"var(--text-2)", fontSize:"0.62rem", fontWeight:600, padding:"2px 8px", borderRadius:"20px", backdropFilter:"blur(4px)" }}>
                        {p.genderCategory}
                      </span>
                    </div>
                    <div style={{ padding:"1rem" }}>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", fontWeight:600, marginBottom:"0.25rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.productName}</div>
                      <div style={{ fontSize:"0.8rem", color:"var(--text-3)", marginBottom:"0.75rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description}</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontWeight:700, color:"var(--rose-light)" }}>₹{p.price?.toLocaleString()}</span>
                        <div style={{ display:"flex", gap:"0.4rem" }}>
                          <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm" style={{ padding:"0.35rem 0.7rem", fontSize:"0.75rem" }}>Edit</button>
                          <button onClick={() => deleteProduct(p.productId, p.productName)} className="btn btn-danger btn-sm" style={{ padding:"0.35rem 0.7rem", fontSize:"0.75rem" }}>Del</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Product Modal ── */}
      {showProductModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", zIndex:5000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn 0.2s ease" }}>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"2rem", width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", position:"relative" }}>
            <button onClick={() => setSPM(false)} style={{ position:"absolute", top:"1rem", right:"1rem", background:"none", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text-2)", cursor:"pointer", width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.6rem", fontWeight:600, marginBottom:"1.5rem" }}>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            {[
              { key:"productName",     label:"Product Name",      type:"text",   required:true },
              { key:"description",     label:"Description",       type:"text" },
              { key:"price",           label:"Price (₹)",         type:"number", required:true },
              { key:"discountPercent", label:"Discount %",        type:"number" },
              { key:"imageUrl",        label:"Image URL / Path",  type:"text" },
            ].map(f => (
              <div key={f.key} className="form-field">
                <label className="form-label">{f.label}{f.required && " *"}</label>
                <input
                  className="form-input"
                  type={f.type}
                  value={productForm[f.key]}
                  onChange={e => setPF(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.label}
                />
              </div>
            ))}

            {/* Gender category — only for super admin */}
            {admin.categoryScope === "All" && (
              <div className="form-field" style={{ position: "relative", zIndex: 6000 }}>
                <label className="form-label">Category</label>
                <CustomDropdown
                  value={productForm.genderCategory || "Men"}
                  onChange={val => setPF(prev => ({ ...prev, genderCategory: val }))}
                  options={["Men","Women","Kids","Accessories"]}
                />
              </div>
            )}

            {/* Image preview */}
            {productForm.imageUrl && (
              <div style={{ marginBottom:"1rem" }}>
                <img
                  src={productForm.imageUrl}
                  alt="Preview"
                  style={{ width:"100%", height:160, objectFit:"cover", borderRadius:"8px", border:"1px solid var(--border)" }}
                  onError={e => { e.target.style.display="none"; }}
                />
              </div>
            )}

            <div style={{ display:"flex", gap:"0.75rem", marginTop:"0.5rem" }}>
              <button className="btn btn-rose" onClick={saveProduct} disabled={savingProduct} style={{ flex:1, justifyContent:"center" }}>
                {savingProduct ? "Saving…" : editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button className="btn btn-ghost" onClick={() => setSPM(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:9000, background:"var(--surface-2)", border:`1px solid ${toast.type==="error" ? "rgba(224,112,112,0.3)" : "rgba(112,200,160,0.3)"}`, borderRadius:"12px", padding:"0.85rem 1.2rem", fontSize:"0.86rem", display:"flex", alignItems:"center", gap:"0.7rem", boxShadow:"0 12px 40px rgba(0,0,0,0.5)", animation:"toastSlide 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}