import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BASE_URL from "../api";
import Navbar from "../component/Navbar";

/* ── constants ──────────────────────────────────────────── */
const GENDER_TABS = ["All", "Women", "Men", "Kids", "Accessories"];

const PRICE_RANGES = [
  { label: "Under ₹500",       min: 0,    max: 500   },
  { label: "₹500 – ₹1,000",   min: 500,  max: 1000  },
  { label: "₹1,000 – ₹2,000", min: 1000, max: 2000  },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000  },
  { label: "Above ₹5,000",     min: 5000, max: Infinity },
];

const DISCOUNT_OPTIONS = [
  { label: "Any",     min: 0  },
  { label: "10%+",    min: 10 },
  { label: "20%+",    min: 20 },
  { label: "30%+",    min: 30 },
  { label: "50%+",    min: 50 },
];

const SORT_OPTIONS = [
  { value: "default",    label: "Featured"          },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "discount",   label: "Best Discount"     },
  { value: "name-asc",   label: "Name: A → Z"       },
  { value: "name-desc",  label: "Name: Z → A"       },
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const BOTTOM_SIZES   = ["28", "30", "32", "34", "36"];
const OTHER_SIZES    = ["Free Size", "One Size"];
const ALL_SIZES      = [...CLOTHING_SIZES, ...BOTTOM_SIZES, ...OTHER_SIZES];

const RATING_OPTIONS = [5, 4, 3];

/* ── helpers ─────────────────────────────────────────────── */
const discountedPrice = (p) =>
  Math.round((p.price || 0) * (1 - (p.discountPercent || p.discount_percent || 0) / 100));

const getGender = (p) =>
  p.genderCategory || p.gender_category || p.categoryName || p.category_name || "Other";

/* ── Filter Section Component ──────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.2rem", marginBottom: "1.2rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 0 0.6rem", color: "var(--text)", fontFamily: "'Outfit', sans-serif",
          fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", marginBottom: open ? "0.8rem" : 0,
          transition: "color 0.2s",
        }}
      >
        <span>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-3)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ── Active Filter Pill ─────────────────────────────────── */
function Pill({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.22rem 0.65rem", borderRadius: "20px",
      background: "var(--rose-dim)", border: "1px solid rgba(232,180,160,0.25)",
      color: "var(--rose)", fontSize: "0.74rem", fontWeight: 600,
      animation: "badgePop 0.2s var(--spring)",
    }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: "0.85rem", display: "flex" }}>×</button>
    </span>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [viewMode, setViewMode]         = useState("grid"); // grid | list
  const [isSortOpen,    setIsSortOpen]    = useState(false); // New state for sort dropdown
  const searchRef                       = useRef(null);

  /* filter state */
  const [search,        setSearch]        = useState(searchParams.get("q")      || "");
  const [genderTab,     setGenderTab]     = useState(searchParams.get("gender") || "All");
  const [priceRange,    setPriceRange]    = useState(searchParams.get("price")  || "");
  const [customMin,     setCustomMin]     = useState("");
  const [customMax,     setCustomMax]     = useState("");
  const [minDiscount,   setMinDiscount]   = useState(Number(searchParams.get("disc") || 0));
  const [selectedSizes, setSelectedSizes] = useState(() => { const s = searchParams.get("sizes"); return s ? s.split(",") : []; });
  const [minRating,     setMinRating]     = useState(0);
  const [onSaleOnly,    setOnSaleOnly]    = useState(false);
  const [inStockOnly,   setInStockOnly]   = useState(false);
  const [newArrivals,   setNewArrivals]   = useState(false);
  const [sortBy,        setSortBy]        = useState(searchParams.get("sort")   || "default");
  const [page,          setPage]          = useState(1);
  const sortDropdownRef                 = useRef(null); // New ref for sort dropdown
  const PER_PAGE = 12;

  /* fetch */
  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(r => r.json())
      .then(data => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([
        { productId:1,  productName:"Floral Wrap Dress",    price:1299, discountPercent:10, description:"Elegant summer wrap dress with floral pattern.", imageUrl:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", genderCategory:"Women" },
        { productId:2,  productName:"Casual Denim Jacket",  price:1899, discountPercent:15, description:"Classic blue denim jacket.",                        imageUrl:"https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", genderCategory:"Women" },
        { productId:3,  productName:"Slim Fit Chinos",      price:999,  discountPercent:5,  description:"Modern slim fit chino pants.",                      imageUrl:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", genderCategory:"Men"   },
        { productId:4,  productName:"Oxford Button Shirt",  price:1199, discountPercent:0,  description:"Classic oxford cotton shirt.",                      imageUrl:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", genderCategory:"Men"   },
        { productId:5,  productName:"Maxi Boho Skirt",      price:799,  discountPercent:20, description:"Bohemian style maxi skirt.",                        imageUrl:"https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?w=400", genderCategory:"Women" },
        { productId:6,  productName:"Kids Printed Tee",     price:399,  discountPercent:0,  description:"Colorful printed t-shirt.",                         imageUrl:"https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400", genderCategory:"Kids"  },
        { productId:7,  productName:"Silk Evening Gown",    price:5999, discountPercent:25, description:"Stunning silk evening gown.",                       imageUrl:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400", genderCategory:"Women" },
        { productId:8,  productName:"Leather Biker Jacket", price:4499, discountPercent:10, description:"Premium leather biker jacket.",                     imageUrl:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", genderCategory:"Men"   },
        { productId:9,  productName:"Floral Midi Dress",    price:1599, discountPercent:30, description:"Beautiful floral midi dress.",                      imageUrl:"https://images.unsplash.com/photo-1594938298603-c8148c4b4f7c?w=400", genderCategory:"Women" },
        { productId:10, productName:"Kids Denim Overalls",  price:699,  discountPercent:5,  description:"Cute denim overalls for kids.",                     imageUrl:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400", genderCategory:"Kids"  },
        { productId:11, productName:"Luxury Watch",         price:8999, discountPercent:0,  description:"Elegant stainless steel timepiece.",                imageUrl:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", genderCategory:"Accessories" },
        { productId:12, productName:"Leather Handbag",      price:3499, discountPercent:20, description:"Premium genuine leather handbag.",                  imageUrl:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", genderCategory:"Accessories" },
        { productId:13, productName:"Linen Trousers",       price:1399, discountPercent:15, description:"Breathable linen trousers.",                        imageUrl:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400", genderCategory:"Men"   },
        { productId:14, productName:"Sundress Stripes",     price:899,  discountPercent:0,  description:"Playful striped sundress.",                         imageUrl:"https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400", genderCategory:"Women" },
        { productId:15, productName:"Kids Hoodie",          price:549,  discountPercent:10, description:"Cosy hoodie for little ones.",                      imageUrl:"https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400", genderCategory:"Kids"  },
        { productId:16, productName:"Silk Scarf",           price:1299, discountPercent:0,  description:"Luxurious 100% silk scarf.",                        imageUrl:"https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", genderCategory:"Accessories" },
      ]))
      .finally(() => setLoading(false));
  }, []);

  /* sync URL */
  useEffect(() => {
    const params = {};
    if (search)               params.q      = search;
    if (genderTab !== "All")  params.gender = genderTab;
    if (priceRange)           params.price  = priceRange;
    if (minDiscount)          params.disc   = String(minDiscount);
    if (selectedSizes.length) params.sizes  = selectedSizes.join(",");
    if (sortBy !== "default") params.sort   = sortBy;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [search, genderTab, priceRange, minDiscount, selectedSizes, sortBy]);

  /* click outside for sort dropdown */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* filtering */
  const filtered = useCallback(() => {
    let list = [...allProducts];

    if (genderTab !== "All")
      list = list.filter(p => getGender(p).toLowerCase() === genderTab.toLowerCase());

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.productName || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }

    if (priceRange) {
      const found = PRICE_RANGES.find(r => r.label === priceRange);
      if (found) list = list.filter(p => { const fp = discountedPrice(p); return fp >= found.min && fp <= found.max; });
    }
    if (customMin !== "" || customMax !== "") {
      const mn = Number(customMin) || 0;
      const mx = Number(customMax) || Infinity;
      list = list.filter(p => { const fp = discountedPrice(p); return fp >= mn && fp <= mx; });
    }

    if (minDiscount > 0)
      list = list.filter(p => (p.discountPercent || p.discount_percent || 0) >= minDiscount);

    if (onSaleOnly)
      list = list.filter(p => (p.discountPercent || p.discount_percent || 0) > 0);

    // Rating filter: simulated since DB doesn't have rating, use productId as seed
    if (minRating > 0)
      list = list.filter(p => {
        const seed = (p.productId % 5) + 3; // 3–7 → mapped to 3.0–5.0
        const r = Math.min(5, Math.round((seed / 7) * 5 * 10) / 10 + 3);
        return r >= minRating;
      });

    // New arrivals: simulate with productId > threshold
    if (newArrivals)
      list = list.filter(p => (p.productId || 0) > 8);

    switch (sortBy) {
      case "price-asc":  list.sort((a,b) => discountedPrice(a) - discountedPrice(b)); break;
      case "price-desc": list.sort((a,b) => discountedPrice(b) - discountedPrice(a)); break;
      case "discount":   list.sort((a,b) => (b.discountPercent||0) - (a.discountPercent||0)); break;
      case "name-asc":   list.sort((a,b) => (a.productName||"").localeCompare(b.productName||"")); break;
      case "name-desc":  list.sort((a,b) => (b.productName||"").localeCompare(a.productName||"")); break;
      default: break;
    }
    return list;
  }, [allProducts, genderTab, search, priceRange, customMin, customMax, minDiscount, onSaleOnly, minRating, newArrivals, sortBy]);

  const results    = filtered();
  const total      = results.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const paginated  = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activePills = [
    search && { label: `"${search}"`, clear: () => { setSearch(""); if (searchRef.current) searchRef.current.value = ""; } },
    priceRange && { label: priceRange, clear: () => setPriceRange("") },
    (customMin || customMax) && { label: `₹${customMin||0}–₹${customMax||"∞"}`, clear: () => { setCustomMin(""); setCustomMax(""); } },
    minDiscount && { label: `${minDiscount}%+ off`, clear: () => setMinDiscount(0) },
    onSaleOnly && { label: "On Sale", clear: () => setOnSaleOnly(false) },
    newArrivals && { label: "New Arrivals", clear: () => setNewArrivals(false) },
    minRating && { label: `${minRating}★+`, clear: () => setMinRating(0) },
    ...selectedSizes.map(s => ({ label: `Size ${s}`, clear: () => setSelectedSizes(prev => prev.filter(x => x !== s)) })),
  ].filter(Boolean);

  const clearAll = () => {
    setSearch(""); setPriceRange(""); setMinDiscount(0); setOnSaleOnly(false);
    setInStockOnly(false); setNewArrivals(false); setMinRating(0);
    setSelectedSizes([]); setCustomMin(""); setCustomMax("");
    setSortBy("default"); setGenderTab("All"); setPage(1);
    if (searchRef.current) searchRef.current.value = "";
  };

  const toggleSize = s =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  /* Simulate a star rating per product */
  const getStars = (productId) => {
    const vals = [4.5, 4.2, 3.8, 4.7, 4.0, 3.5, 4.8, 4.1, 4.3, 3.9, 4.6, 4.4, 3.7, 4.2, 4.0, 4.5];
    return vals[(productId - 1) % vals.length] || 4.0;
  };

  /* ── SIDEBAR ──────────────────────────────────────────── */
  const Sidebar = (
    <aside style={{
      width: 272, flexShrink: 0,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem 0.5rem 1.5rem 1.5rem",
      position: "sticky", top: 80,
      maxHeight: "calc(100vh - 100px)",
      animation: "slideInRight 0.4s ease",
      display: "flex", flexDirection: "column"
    }}>
      <div className="cat-sidebar-inner" style={{
        overflowY: "auto", overflowX: "hidden",
        paddingRight: "1rem", flex: 1,
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.1) transparent",
      }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
          {activePills.length > 0 && (
            <span style={{ background: "var(--rose)", color: "#0a0a0b", fontSize: "0.65rem", fontWeight: 800, padding: "0.1rem 0.45rem", borderRadius: "20px" }}>
              {activePills.length}
            </span>
          )}
        </span>
        {activePills.length > 0 && (
          <button onClick={clearAll} style={{ background: "none", border: "none", color: "var(--rose)", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <FilterSection title="Search">
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={searchRef}
            defaultValue={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            style={{ width: "100%", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.6rem 0.8rem 0.6rem 2.1rem", color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "var(--rose)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
        </div>
      </FilterSection>

      {/* ── Category ── */}
      <FilterSection title="Category">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {GENDER_TABS.map(tab => (
            <button key={tab} onClick={() => { setGenderTab(tab); setPage(1); }} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.55rem 0.75rem", borderRadius: "8px", border: "none",
              background: genderTab === tab ? "var(--rose-dim)" : "transparent",
              color: genderTab === tab ? "var(--rose)" : "var(--text-2)",
              fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem", fontWeight: genderTab === tab ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s", textAlign: "left",
            }}>
              <span>{tab}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                {tab === "All" ? allProducts.length : allProducts.filter(p => getGender(p).toLowerCase() === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Price Range ── */}
      <FilterSection title="Price Range">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {PRICE_RANGES.map(r => (
            <label key={r.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", padding: "0.35rem 0" }}>
              <input type="radio" name="price" checked={priceRange === r.label}
                onChange={() => { setPriceRange(r.label); setCustomMin(""); setCustomMax(""); setPage(1); }}
                style={{ accentColor: "var(--rose)", width: 14, height: 14 }}
              />
              <span style={{ fontSize: "0.85rem", color: priceRange === r.label ? "var(--rose)" : "var(--text-2)", fontWeight: priceRange === r.label ? 600 : 400 }}>{r.label}</span>
            </label>
          ))}
          {priceRange && (
            <button onClick={() => setPriceRange("")} style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: "0.76rem", cursor: "pointer", textAlign: "left", padding: "0.2rem 0", fontFamily: "'Outfit', sans-serif" }}>
              ✕ Clear
            </button>
          )}
        </div>
        {/* Custom price */}
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Custom range (₹)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[["Min", customMin, setCustomMin], ["Max", customMax, setCustomMax]].map(([ph, val, set]) => (
              <input key={ph} type="number" placeholder={ph} value={val}
                onChange={e => { set(e.target.value); setPriceRange(""); setPage(1); }}
                style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "7px", padding: "0.5rem 0.6rem", color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", outline: "none", width: "100%", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "var(--rose)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            ))}
          </div>
        </div>
      </FilterSection>

      {/* ── Discount ── */}
      <FilterSection title="Discount">
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {DISCOUNT_OPTIONS.map(d => (
            <button key={d.label} onClick={() => { setMinDiscount(d.min); setPage(1); }} style={{
              padding: "0.35rem 0.8rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600,
              border: `1px solid ${minDiscount === d.min ? "var(--rose)" : "var(--border)"}`,
              background: minDiscount === d.min ? "var(--rose-dim)" : "transparent",
              color: minDiscount === d.min ? "var(--rose)" : "var(--text-2)",
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
            }}>
              {d.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Size ── */}
      <FilterSection title="Size">
        {[["Clothing", CLOTHING_SIZES], ["Bottoms", BOTTOM_SIZES], ["Other", OTHER_SIZES]].map(([group, sizes]) => (
          <div key={group} style={{ marginBottom: "0.8rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{group}</div>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {sizes.map(s => (
                <button key={s} onClick={() => { toggleSize(s); setPage(1); }} style={{
                  padding: "0.32rem 0.7rem", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 600,
                  border: `1px solid ${selectedSizes.includes(s) ? "var(--rose)" : "var(--border)"}`,
                  background: selectedSizes.includes(s) ? "var(--rose-dim)" : "var(--bg-3)",
                  color: selectedSizes.includes(s) ? "var(--rose)" : "var(--text-2)",
                  cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif",
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </FilterSection>

      {/* ── Rating ── */}
      <FilterSection title="Customer Rating">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {RATING_OPTIONS.map(r => (
            <button key={r} onClick={() => { setMinRating(minRating === r ? 0 : r); setPage(1); }} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.6rem",
              borderRadius: "8px", border: "none", background: minRating === r ? "var(--rose-dim)" : "transparent",
              cursor: "pointer", transition: "all 0.2s", textAlign: "left",
            }}>
              <span style={{ color: "#e8b44f", fontSize: "0.88rem", letterSpacing: "0.05em" }}>
                {"★".repeat(r)}{"☆".repeat(5 - r)}
              </span>
              <span style={{ fontSize: "0.8rem", color: minRating === r ? "var(--rose)" : "var(--text-2)", fontWeight: minRating === r ? 600 : 400, fontFamily: "'Outfit', sans-serif" }}>
                & above
              </span>
              {minRating === r && <span style={{ marginLeft: "auto", color: "var(--rose)", fontSize: "0.75rem" }}>✓</span>}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Availability ── */}
      <FilterSection title="Availability">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { label: "On Sale", val: onSaleOnly, set: setOnSaleOnly, desc: "Discounted items" },
            { label: "In Stock", val: inStockOnly, set: setInStockOnly, desc: "Ready to ship" },
            { label: "New Arrivals", val: newArrivals, set: setNewArrivals, desc: "Added recently" },
          ].map(({ label, val, set, desc }) => (
            <label key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: "0.86rem", color: "var(--text)", fontFamily: "'Outfit', sans-serif" }}>{label}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{desc}</div>
              </div>
              <div
                onClick={() => { set(!val); setPage(1); }}
                style={{
                  width: 40, height: 22, borderRadius: 20, border: "none",
                  background: val ? "var(--rose)" : "var(--surface-3)",
                  cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: val ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }} />
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── Sort (sidebar copy) ── */}
      <FilterSection title="Sort By" defaultOpen={false}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { setSortBy(o.value); setPage(1); }} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.5rem 0.6rem", borderRadius: "8px", border: "none",
              background: sortBy === o.value ? "var(--rose-dim)" : "transparent",
              color: sortBy === o.value ? "var(--rose)" : "var(--text-2)",
              fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem",
              fontWeight: sortBy === o.value ? 600 : 400, cursor: "pointer", transition: "all 0.2s",
            }}>
              <span>{o.label}</span>
              {sortBy === o.value && <span style={{ fontSize: "0.75rem", color: "var(--rose)" }}>✓</span>}
            </button>
          ))}
        </div>
      </FilterSection>
      </div>
    </aside>
  );

  /* ── PAGE RENDER ─────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <style>{`
        /* Sidebar and Drawer Scrollbars */
        .cat-sidebar-inner::-webkit-scrollbar, .cat-drawer::-webkit-scrollbar { width: 5px; }
        .cat-sidebar-inner::-webkit-scrollbar-track, .cat-drawer::-webkit-scrollbar-track { background: transparent; }
        .cat-sidebar-inner::-webkit-scrollbar-thumb, .cat-drawer::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 5px; }
        .cat-sidebar-inner::-webkit-scrollbar-thumb:hover, .cat-drawer::-webkit-scrollbar-thumb:hover { background: rgba(232,180,160,0.4); }

        @keyframes dropdownScale {
          0%   { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes catReveal { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .cat-product-card { animation: catReveal 0.4s ease both; }
        .cat-product-card:hover .cat-overlay { opacity:1 !important; }
        .cat-product-card:hover img { transform:scale(1.06); }
        .cat-product-card img { transition: transform 0.5s ease; }

        /* list view */
        .list-card { display:flex; gap:1.2rem; align-items:center; padding:1rem; border-radius:var(--radius); border:1px solid var(--border); background:var(--surface); transition:border-color 0.2s,box-shadow 0.2s; text-decoration:none; color:inherit; animation:catReveal 0.4s ease both; }
        .list-card:hover { border-color:rgba(232,180,160,0.25); box-shadow:0 8px 30px rgba(0,0,0,0.3); }
        .list-card img { width:80px; height:90px; object-fit:cover; border-radius:8px; flex-shrink:0; transition:transform 0.4s; }
        .list-card:hover img { transform:scale(1.04); }

        /* mobile drawer */
        .cat-drawer { position:fixed; top:0; left:0; transform:translateX(-100%); height:100vh; width:min(300px,85vw); z-index:1200; background:var(--bg-2); overflow-y:auto; padding:1.5rem; border-right:1px solid var(--border); transition:transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s ease; box-shadow:none; }
        .cat-drawer.open { transform:translateX(0); box-shadow: 20px 0 80px rgba(0,0,0,0.6); }
        .cat-drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); z-index:1100; opacity:0; pointer-events:none; transition:opacity 0.35s ease; }
        .cat-drawer-overlay.open { opacity:1; pointer-events:auto; }

        @media(max-width:1000px) {
          .cat-sidebar-desktop { display:none!important; }
          .cat-mobile-btn { display:flex!important; }
        }
        @media(min-width:1001px) {
          .cat-mobile-btn { display:none!important; }
        }
        @media(max-width:600px) {
          .cat-grid { grid-template-columns:repeat(2,1fr)!important; gap:0.8rem!important; }
        }
      `}</style>

      <div style={{ minHeight: "calc(100vh - 68px)", background: "var(--bg)" }}>

        {/* ── Mobile drawer overlay ── */}
        <div className={`cat-drawer-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <div className={`cat-drawer${sidebarOpen ? " open" : ""}`}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <span style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.3rem", fontWeight:600, color:"var(--rose)" }}>Filters</span>
            <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text-2)", cursor:"pointer", padding:"0.35rem 0.55rem", display:"flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {Sidebar}
          <button className="btn btn-rose btn-full" style={{ marginTop:"1.5rem" }} onClick={() => setSidebarOpen(false)}>
            Show {total} Result{total !== 1 ? "s" : ""}
          </button>
        </div>

        {/* ── Hero strip ── */}
        <div style={{ background:"linear-gradient(135deg,#0d0d12 0%,#12101a 50%,#0a0e12 100%)", borderBottom:"1px solid var(--border)", padding:"2.8rem 2rem 2rem", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-60px", left:"8%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle,rgba(232,180,160,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-80px", right:"4%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(126,205,200,0.05) 0%,transparent 70%)", pointerEvents:"none" }} />
          <div style={{ maxWidth:1360, margin:"0 auto", position:"relative", zIndex:1 }}>
            <div className="breadcrumb" style={{ marginBottom:"0.8rem" }}>
              <Link to="/products">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <span style={{ color:"var(--rose)" }}>Collections</span>
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.8rem,4vw,3rem)", color:"var(--text)", fontWeight:600, marginBottom:"0.3rem" }}>
              Browse Collections
            </h1>
            <p style={{ color:"var(--text-2)", fontSize:"0.88rem" }}>
              {loading ? "Loading…" : <><span style={{ color:"var(--rose)", fontWeight:600 }}>{total}</span> styles curated for you</>}
            </p>

            {/* Gender tabs */}
            <div style={{ display:"flex", gap:"0.45rem", marginTop:"1.5rem", flexWrap:"wrap" }}>
              {GENDER_TABS.map(tab => (
                <button key={tab} onClick={() => { setGenderTab(tab); setPage(1); }} style={{
                  padding:"0.45rem 1.2rem", borderRadius:"30px", fontSize:"0.83rem", fontWeight: genderTab === tab ? 600 : 400,
                  border:`1px solid ${genderTab === tab ? "var(--rose)" : "var(--border)"}`,
                  background: genderTab === tab ? "var(--rose-dim)" : "rgba(255,255,255,0.03)",
                  color: genderTab === tab ? "var(--rose)" : "var(--text-2)",
                  cursor:"pointer", transition:"all 0.2s", fontFamily:"'Outfit', sans-serif",
                }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div style={{ maxWidth:1360, margin:"0 auto", padding:"1.8rem 1.5rem 4rem", display:"flex", gap:"1.8rem", alignItems:"flex-start" }}>

          {/* Desktop sidebar */}
          <div className="cat-sidebar-desktop" style={{ width:272, flexShrink:0 }}>
            {Sidebar}
          </div>

          {/* ── Content ── */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"1.2rem", flexWrap:"wrap" }}>
              {/* Mobile filter btn */}
              <button className="cat-mobile-btn btn btn-ghost btn-sm" style={{ display:"none", alignItems:"center", gap:"0.5rem" }} onClick={() => setSidebarOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {activePills.length > 0 && `(${activePills.length})`}
              </button>

              {/* Result count */}
              <span style={{ fontSize:"0.84rem", color:"var(--text-2)", marginRight:"auto" }}>
                <span style={{ color:"var(--rose)", fontWeight:700 }}>{total}</span> item{total !== 1 ? "s" : ""}
              </span>

              {/* Sort dropdown */}
              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", position:"relative", zIndex: 10 }} ref={sortDropdownRef}>
                <span style={{ fontSize:"0.76rem", color:"var(--text-3)", whiteSpace:"nowrap" }}>Sort</span>
                <div
                  onClick={() => setIsSortOpen(o => !o)}
                  style={{
                    background: "var(--surface)", border: `1px solid ${isSortOpen ? 'var(--rose)' : 'var(--border)'}`,
                    borderRadius: "8px", color: "var(--text)", padding: "0.45rem 0.75rem",
                    fontFamily: "'Outfit', sans-serif", fontSize: "0.83rem", cursor: "pointer",
                    outline: "none", display: "flex", alignItems: "center", gap: "0.5rem",
                    minWidth: 160, justifyContent: "space-between"
                  }}
                >
                  <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label || "Featured"}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {isSortOpen && (
                  <ul style={{
                    position: "absolute", top: "100%", right: 0, marginTop: "0.4rem",
                    background: "var(--bg-3)", border: "1px solid var(--border)",
                    borderRadius: "10px", padding: "0.4rem", listStyle: "none",
                    width: "100%", minWidth: 200,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    animation: "dropdownScale 0.2s ease-out forwards", transformOrigin: "top right"
                  }}>
                    {SORT_OPTIONS.map(o => (
                      <li key={o.value}
                        onClick={() => { setSortBy(o.value); setPage(1); setIsSortOpen(false); }}
                        style={{
                          padding: "0.6rem 0.8rem", borderRadius: "6px",
                          color: sortBy === o.value ? "var(--rose)" : "var(--text-2)",
                          background: sortBy === o.value ? "var(--rose-dim)" : "transparent",
                          cursor: "pointer", transition: "all 0.2s",
                          fontSize: "0.85rem", fontWeight: sortBy === o.value ? 600 : 400
                        }}
                      >{o.label}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* View toggle */}
              <div style={{ display:"flex", border:"1px solid var(--border)", borderRadius:"8px", overflow:"hidden" }}>
                {[
                  { mode:"grid", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
                  { mode:"list", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
                ].map(({ mode, icon }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ padding:"0.45rem 0.65rem", background: viewMode === mode ? "var(--rose-dim)" : "transparent", border:"none", cursor:"pointer", color: viewMode === mode ? "var(--rose)" : "var(--text-3)", transition:"all 0.2s", display:"flex", alignItems:"center" }}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", marginBottom:"1rem" }}>
                {activePills.map((p, i) => <Pill key={i} label={p.label} onRemove={p.clear} />)}
                <button onClick={clearAll} style={{ padding:"0.22rem 0.65rem", borderRadius:"20px", border:"1px solid rgba(224,112,112,0.3)", background:"rgba(224,112,112,0.06)", color:"var(--danger)", fontSize:"0.74rem", fontWeight:600, cursor:"pointer", fontFamily:"'Outfit', sans-serif" }}>
                  Clear all ×
                </button>
              </div>
            )}

            {/* ── Products ── */}
            {loading ? (
              <div className="cat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1.2rem" }}>
                {Array.from({length:8}).map((_,i) => (
                  <div key={i} className="product-card" style={{ display: "flex", flexDirection: "column", padding: 0, height: "100%", minHeight: 380, border: "1px solid var(--glass-border)", background: "var(--glass-1)" }}>
                    <div className="skeleton" style={{ height: 260, width: "100%", borderRadius: "var(--radius-xl) var(--radius-xl) 0 0" }} />
                    <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: "30%", borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 20, width: "80%", borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 14, width: "100%", borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 4 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "1rem" }}>
                        <div className="skeleton" style={{ height: 20, width: "40%", borderRadius: 4 }} />
                        <div className="skeleton" style={{ height: 20, width: "20%", borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No products found</h3>
                <p style={{ marginBottom:"1.5rem" }}>Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="btn btn-rose">Clear Filters</button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="cat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"1.2rem" }}>
                {paginated.map((p, idx) => {
                  const pId    = p.productId || p.product_id;
                  const pName  = p.productName || p.product_name || "";
                  const pImage = p.imageUrl || p.image_url || "https://via.placeholder.com/300";
                  const pDisc  = p.discountPercent || p.discount_percent || 0;
                  const orig   = p.price || 0;
                  const final  = discountedPrice(p);
                  const stars  = getStars(pId);
                  const cat    = getGender(p);

                  return (
                    <Link to={`/product/${pId}`} key={pId} className="cat-product-card product-card" style={{ animationDelay:`${Math.min(idx,7)*0.05}s`, textDecoration:"none", color:"inherit", display:"block" }}>
                      <div className="product-card-img-wrap" style={{ position:"relative", overflow:"hidden" }}>
                        <img src={pImage} alt={pName} className="product-card-img" />
                        {pDisc > 0 && (
                          <span style={{ position:"absolute", top:10, left:10, background:"var(--rose)", color:"#0a0a0b", fontSize:"0.65rem", fontWeight:800, padding:"3px 9px", borderRadius:"20px" }}>
                            -{pDisc}%
                          </span>
                        )}
                        <div className="cat-overlay" style={{ position:"absolute", inset:0, background:"rgba(5,5,7,0.38)", display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"1rem", opacity:0, transition:"opacity 0.25s", borderRadius:"inherit" }}>
                          <span style={{ background:"rgba(232,180,160,0.92)", color:"#0a0a0b", fontSize:"0.76rem", fontWeight:700, padding:"0.38rem 1.1rem", borderRadius:"30px", fontFamily:"'Outfit', sans-serif" }}>
                            View Details →
                          </span>
                        </div>
                      </div>
                      <div className="product-card-body">
                        <div className="product-card-cat">{cat}</div>
                        <h3 className="product-card-name">{pName}</h3>
                        {/* Stars */}
                        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", marginBottom:"0.5rem" }}>
                          <span style={{ color:"#e8b44f", fontSize:"0.78rem" }}>
                            {"★".repeat(Math.floor(stars))}{"☆".repeat(5-Math.floor(stars))}
                          </span>
                          <span style={{ fontSize:"0.72rem", color:"var(--text-3)" }}>({stars})</span>
                        </div>
                        <div className="product-card-footer">
                          <div>
                            <span className="product-price">₹{final.toLocaleString()}</span>
                            {pDisc > 0 && <span className="product-original-price">₹{orig.toLocaleString()}</span>}
                          </div>
                          <span style={{ fontSize:"0.75rem", color:"var(--rose)", fontWeight:600 }}>→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* ── LIST VIEW ── */
              <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
                {paginated.map((p, idx) => {
                  const pId    = p.productId || p.product_id;
                  const pName  = p.productName || p.product_name || "";
                  const pImage = p.imageUrl || p.image_url || "https://via.placeholder.com/80";
                  const pDisc  = p.discountPercent || p.discount_percent || 0;
                  const orig   = p.price || 0;
                  const final  = discountedPrice(p);
                  const stars  = getStars(pId);
                  const cat    = getGender(p);

                  return (
                    <Link to={`/product/${pId}`} key={pId} className="list-card" style={{ animationDelay:`${Math.min(idx,7)*0.04}s` }}>
                      <div style={{ overflow:"hidden", borderRadius:8, flexShrink:0 }}>
                        <img src={pImage} alt={pName} style={{ width:80, height:90, objectFit:"cover", display:"block" }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.7rem", color:"var(--rose)", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, marginBottom:"0.25rem" }}>{cat}</div>
                        <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.05rem", fontWeight:600, marginBottom:"0.25rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pName}</div>
                        <div style={{ fontSize:"0.8rem", color:"var(--text-2)", marginBottom:"0.4rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.3rem" }}>
                          <span style={{ color:"#e8b44f", fontSize:"0.76rem" }}>{"★".repeat(Math.floor(stars))}{"☆".repeat(5-Math.floor(stars))}</span>
                          <span style={{ fontSize:"0.7rem", color:"var(--text-3)" }}>({stars})</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:"1.1rem", fontWeight:700, color:"var(--rose-light)" }}>₹{final.toLocaleString()}</div>
                        {pDisc > 0 && (
                          <>
                            <div style={{ fontSize:"0.78rem", color:"var(--text-3)", textDecoration:"line-through" }}>₹{orig.toLocaleString()}</div>
                            <div style={{ fontSize:"0.68rem", background:"var(--rose-dim)", color:"var(--rose)", padding:"0.15rem 0.5rem", borderRadius:"20px", fontWeight:700, marginTop:"0.2rem", display:"inline-block" }}>-{pDisc}%</div>
                          </>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
                flexWrap: "wrap", padding: "0.75rem 1rem",
                background: "var(--glass-1)", border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-pill)", backdropFilter: "blur(12px)",
                width: "fit-content", margin: "3.5rem auto 0", boxShadow: "var(--shadow-sm)"
              }}>
                <button onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === 1} className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-pill)", padding: "0.4rem 0.8rem", fontSize: "0.76rem" }}>«</button>
                <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === 1} className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-pill)", padding: "0.4rem 1rem" }}>‹ Prev</button>

                {Array.from({length:Math.min(7,totalPages)},(_,i) => {
                  let num;
                  if (totalPages <= 7)           num = i+1;
                  else if (page <= 4)            num = i+1;
                  else if (page >= totalPages-3) num = totalPages-6+i;
                  else                           num = page-3+i;
                  if (num<1||num>totalPages) return null;
                  return (
                    <button
                      key={num}
                      onClick={() => { setPage(num); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`btn btn-sm ${page === num ? "btn-rose" : "btn-ghost"}`}
                      style={{ width: 36, height: 36, padding: 0, justifyContent: "center", borderRadius: "50%", fontWeight: page === num ? 700 : 500, transition: "all var(--spring)" }}
                    >
                      {num}
                    </button>
                  );
                })}

                <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === totalPages} className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-pill)", padding: "0.4rem 1rem" }}>Next ›</button>
                <button onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page === totalPages} className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-pill)", padding: "0.4rem 0.8rem", fontSize: "0.76rem" }}>»</button>
              </div>
            )}

          </div>{/* /content */}
        </div>{/* /main layout */}
      </div>
    </>
  );
}