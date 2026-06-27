import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";
import Navbar from "../component/Navbar";

const CATEGORIES = ["All", "Women", "Men", "Kids", "Accessories"];

// ── Per-category pinned bestseller fallbacks ────────────────────────
const BS_FALLBACKS = {
  All: {
    productId: 91,
    productName: "Men Denim Jacket",
    price: 2499,
    discountPercent: 20,
    description: "A rugged yet refined men's denim jacket crafted from premium stonewashed denim. Tailored fit that pairs effortlessly with any outfit — from casual tees to smart-casual looks.",
    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=600&auto=format&fit=crop",
    categoryName: "Men", gender_category: "Men",
  },
  Women: {
    productId: 92,
    productName: "Women Kurti",
    price: 1199,
    discountPercent: 25,
    description: "A beautifully crafted ethnic Kurti in soft breathable cotton. Features vibrant block prints, a relaxed flared hem, and intricate neckline embroidery — perfect for festive days and everyday elegance.",
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?q=80&w=600&auto=format&fit=crop",
    categoryName: "Women", gender_category: "Women",
  },
  Men: {
    productId: 93,
    productName: "Men Denim Jacket",
    price: 2499,
    discountPercent: 20,
    description: "A rugged yet refined men's denim jacket crafted from premium stonewashed denim. Features a classic collar, chest pockets, and a tailored fit that pairs effortlessly with any outfit.",
    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=600&auto=format&fit=crop",
    categoryName: "Men", gender_category: "Men",
  },
  Kids: {
    productId: 94,
    productName: "Kids Printed Tee",
    price: 499,
    discountPercent: 15,
    description: "Soft and vibrant cotton tee for the little ones. Features fun graphic prints, a comfortable crew neck, and breathable fabric perfect for playful active days.",
    imageUrl: "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?q=80&w=600&auto=format&fit=crop",
    categoryName: "Kids", gender_category: "Kids",
  },
  Accessories: {
    productId: 95,
    productName: "Sunglasses",
    price: 1599,
    discountPercent: 18,
    description: "Premium UV400 polarized sunglasses with a sleek acetate frame and scratch-resistant lenses. Effortlessly elevates any look from beach days to city streets.",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
    categoryName: "Accessories", gender_category: "Accessories",
  },
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  // bestsellers keyed by slide id — each slide gets its own pinned product
  const [bestsellers, setBestsellers] = useState(BS_FALLBACKS);

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(r => r.json())
      .then(data => {
        const shuffled = data.sort(() => Math.random() - 0.5);
        setProducts(shuffled);

        // Helper: find first product whose name includes ALL of the given keywords
        const find = (...keywords) =>
          data.find(p => {
            const n = (p.productName || p.product_name || '').toLowerCase();
            return keywords.every(k => n.includes(k));
          });

        // Helper: best-discount product in a gender/category group
        const bestInGroup = (group) => {
          const grp = group.toLowerCase();
          const pool = data.filter(p => {
            const g = (p.genderCategory || p.gender_category || '').toLowerCase();
            const c = (p.categoryName   || p.category_name   || '').toLowerCase();
            return g === grp || c.includes(grp);
          });
          if (!pool.length) return null;
          return pool.reduce((best, p) => {
            const bd = best.discountPercent || best.discount_percent || 0;
            const pd =    p.discountPercent ||    p.discount_percent || 0;
            return pd > bd ? p : best;
          }, pool[0]);
        };

        setBestsellers(prev => ({
          All:         find('denim','jacket') || find('denim') || bestInGroup('men')       || prev.All,
          Women:       find('kurti')          || find('kurti','women') || bestInGroup('women') || prev.Women,
          Men:         find('denim','jacket') || find('denim') || bestInGroup('men')       || prev.Men,
          Kids:        find('kids')           || bestInGroup('kids')                       || prev.Kids,
          Accessories: find('sunglass')       || find('glass') || bestInGroup('accessories') || prev.Accessories,
        }));
      })
      .catch(() => {
        // UI fallback products list
        const fallbackData = [
          { productId: 1, productName: "Floral Wrap Dress",   price: 1299, discountPercent: 10, description: "Elegant summer wrap dress with floral pattern.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", categoryName: "Women", gender_category: "Women" },
          { productId: 2, productName: "Casual Denim Jacket", price: 1899, discountPercent: 15, description: "Classic blue denim jacket for everyday wear.",    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", categoryName: "Men",   gender_category: "Men"   },
          { productId: 3, productName: "Slim Fit Chinos",     price: 999,  discountPercent: 5,  description: "Modern slim fit chino pants in neutral tones.", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", categoryName: "Men",   gender_category: "Men"   },
          { productId: 4, productName: "Women Kurti",         price: 1199, discountPercent: 25, description: "Beautifully crafted ethnic Kurti in soft cotton.", imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?w=400", categoryName: "Women", gender_category: "Women" },
          { productId: 5, productName: "Kids Printed Tee",    price: 499,  discountPercent: 15, description: "Colorful printed t-shirt in soft cotton.",       imageUrl: "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400", categoryName: "Kids",  gender_category: "Kids"  },
          { productId: 6, productName: "Sunglasses",          price: 1599, discountPercent: 18, description: "Premium UV400 polarized sunglasses.",             imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", categoryName: "Accessories", gender_category: "Accessories" },
        ];
        setProducts(fallbackData.sort(() => Math.random() - 0.5));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const carousel = document.getElementById('hero-carousel');
      if (carousel) {
        // Pause auto-sliding if user is hovering over the carousel or modal is open
        if (document.querySelector('#hero-carousel:hover') || document.querySelector('.bs-modal-overlay')) {
          return;
        }
        const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;
        if (isAtEnd) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
        }
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryHighlights = () => {
    const catProducts = products.filter(p => {
      const pGender = p.genderCategory || p.gender_category;
      const pCat = p.categoryName || p.category_name || "";
      return category === "All" || 
             (pGender && pGender.toLowerCase() === category.toLowerCase()) || 
             pCat.toLowerCase().includes(category.toLowerCase());
    });

    if (catProducts.length === 0) return null;

    const highestPriceProd = catProducts.reduce((max, p) => (p.price > max.price ? p : max), catProducts[0]);
    const lowestPriceProd = catProducts.reduce((min, p) => (p.price < min.price ? p : min), catProducts[0]);
    const bestSellerProd = bestsellers[category] || catProducts[0];

    return {
      highest: highestPriceProd,
      lowest: lowestPriceProd,
      bestseller: bestSellerProd,
      totalCount: catProducts.length
    };
  };

  const highlights = getCategoryHighlights();

  const discounted = (p) => Math.round((p.price || 0) * (1 - (p.discountPercent || p.discount_percent || 0) / 100));

  const filtered = products.filter(p => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase()) ||
                        p.description?.toLowerCase().includes(search.toLowerCase());
    
    // Check both camelCase and snake_case in case the backend passes the raw DB column name
    const pGender = p.genderCategory || p.gender_category;
    const pCat = p.categoryName || p.category_name || "";
    
    const matchCat = category === "All" || 
                     (pGender && pGender.toLowerCase() === category.toLowerCase()) || 
                     pCat.toLowerCase().includes(category.toLowerCase());
    return matchSearch && matchCat;
  });

  if (loading) return <span className="spinner" />;

  return (
    <>
      <Navbar />
      <div className="page-wrapper page-enter">
      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
          .filter-bar { flex-wrap: wrap; justify-content: flex-start; }
          .search-input-wrap { width: 100%; flex: 1 1 100%; margin-bottom: 0.5rem; }
          .filter-pill { flex-grow: 1; text-align: center; }
        }
      `}</style>
      <div style={{ position: 'relative', margin: '1rem 0 3rem 0', borderRadius: '24px', overflow: 'hidden' }}>
        <button 
          className="hero-nav-btn prev"
          onClick={() => {
            const carousel = document.getElementById('hero-carousel');
            if (carousel) {
              if (carousel.scrollLeft <= 10) {
                carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
              } else {
                carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
              }
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div id="hero-carousel" className="hero-carousel-wrapper" style={{ overflowX: 'auto', display: 'flex', scrollSnapType: 'x mandatory' }}>
          {[
            { id: 'All', title: 'Elevate Your', titleSpan: 'Everyday Style', sub: 'Discover our new arrivals featuring premium fabrics, modern silhouettes, and timeless elegance designed just for you.', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop' },
            { id: 'Women', title: 'Women\'s', titleSpan: 'Elegance', sub: 'Discover graceful silhouettes and premium fabrics designed exactly to empower your personal style.', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop' },
            { id: 'Men', title: 'Men\'s', titleSpan: 'Classics', sub: 'Refined menswear for the modern gentleman, featuring premium tailored fits and timeless style.', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1000&auto=format&fit=crop' },
            { id: 'Kids', title: 'Playful', titleSpan: 'Kids', sub: 'Comfortable and stylish wear for the little ones, crafted with care for their active days.', img: 'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?q=80&w=1000&auto=format&fit=crop' },
            { id: 'Accessories', title: 'Luxury', titleSpan: 'Accessories', sub: 'The perfect finishing touch to any outfit, crafted with exquisite detail and high-end materials.', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop' }
          ].map(item => (
            // Each slide gets its own pinned category bestseller
            <HeroSlide
              key={item.id}
              item={item}
              bestseller={bestsellers[item.id]}
              discounted={discounted}
              setCategory={setCategory}
            />
          ))}
        </div>

        <button 
          className="hero-nav-btn next"
          onClick={() => {
            const carousel = document.getElementById('hero-carousel');
            if (carousel) {
              const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;
              if (isAtEnd) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
              } else {
                carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
              }
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            className="search-input"
            placeholder="Search styles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {highlights && (
        <div className="category-highlights">
          <div className="ch-header">
            <h2 className="ch-title">{category} Collection Showcase</h2>
            <p className="ch-subtitle">Discover the top highlights, best values, and premium picks in {category}</p>
          </div>
          <div className="ch-grid">
            {/* Card 1: Best Seller */}
            <Link to={`/product/${highlights.bestseller.productId || highlights.bestseller.product_id || highlights.bestseller.id}`} className="ch-card ch-card-bestseller">
              <div className="ch-badge ch-badge-yellow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Best Seller
              </div>
              <div className="ch-card-body">
                <img className="ch-card-img" src={highlights.bestseller.imageUrl || highlights.bestseller.image_url} alt={highlights.bestseller.productName || highlights.bestseller.product_name} />
                <div className="ch-card-info">
                  <h4 className="ch-prod-name">{highlights.bestseller.productName || highlights.bestseller.product_name}</h4>
                  <div className="ch-price-row">
                    <span className="ch-price-final">₹{discounted(highlights.bestseller)}</span>
                    {(highlights.bestseller.discountPercent || highlights.bestseller.discount_percent) > 0 && (
                      <span className="ch-price-orig">₹{highlights.bestseller.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 2: Lowest Price (Minimum Amount) */}
            <Link to={`/product/${highlights.lowest.productId || highlights.lowest.product_id}`} className="ch-card ch-card-lowest">
              <div className="ch-badge ch-badge-green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Best Value (Lowest Price)
              </div>
              <div className="ch-card-body">
                <img className="ch-card-img" src={highlights.lowest.imageUrl || highlights.lowest.image_url} alt={highlights.lowest.productName || highlights.lowest.product_name} />
                <div className="ch-card-info">
                  <h4 className="ch-prod-name">{highlights.lowest.productName || highlights.lowest.product_name}</h4>
                  <div className="ch-price-row">
                    <span className="ch-price-final">₹{discounted(highlights.lowest)}</span>
                    {(highlights.lowest.discountPercent || highlights.lowest.discount_percent) > 0 && (
                      <span className="ch-price-orig">₹{highlights.lowest.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 3: Highest Price */}
            <Link to={`/product/${highlights.highest.productId || highlights.highest.product_id}`} className="ch-card ch-card-highest">
              <div className="ch-badge ch-badge-rose">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Premium Pick (Highest Price)
              </div>
              <div className="ch-card-body">
                <img className="ch-card-img" src={highlights.highest.imageUrl || highlights.highest.image_url} alt={highlights.highest.productName || highlights.highest.product_name} />
                <div className="ch-card-info">
                  <h4 className="ch-prod-name">{highlights.highest.productName || highlights.highest.product_name}</h4>
                  <div className="ch-price-row">
                    <span className="ch-price-final">₹{discounted(highlights.highest)}</span>
                    {(highlights.highest.discountPercent || highlights.highest.discount_percent) > 0 && (
                      <span className="ch-price-orig">₹{highlights.highest.price}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon" style={{ display: 'inline-flex', marginBottom: '1rem', color: 'var(--text-3)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <h3>No results found</h3>
          <p>Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map(p => {
            const pId = p.productId || p.product_id;
            const pName = p.productName || p.product_name;
            const pImage = p.imageUrl || p.image_url;
            const pDiscount = p.discountPercent || p.discount_percent || 0;
            const pCat = p.genderCategory || p.gender_category || p.categoryName || p.category_name;
            
            return (
            <Link to={`/product/${pId}`} key={pId} className="product-card">
              <div className="product-card-img-wrap">
                <img src={pImage} alt={pName} className="product-card-img" />
                {pDiscount > 0 && (
                  <span className="product-badge">-{pDiscount}%</span>
                )}
              </div>
              <div className="product-card-body">
                {pCat && <div className="product-card-cat">{pCat}</div>}
                <h3 className="product-card-name">{pName}</h3>
                <p className="product-card-desc">{p.description?.substring(0, 65)}…</p>
                <div className="product-card-footer">
                  <div>
                    <span className="product-price">₹{discounted(p)}</span>
                    {pDiscount > 0 && (
                      <span className="product-original-price">₹{p.price}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            </Link>
          )})}
        </div>
      )}
      </div>
    </>
  );
}

/* ── HeroSlide sub-component ────────────────────────────────────────── */
function HeroSlide({ item, bestseller, discounted, setCategory }) {
  const [modalOpen, setModalOpen] = useState(false);
  const closeTimer = useRef(null);

  const openModal  = () => { clearTimeout(closeTimer.current); setModalOpen(true);  };
  const closeModal = () => { clearTimeout(closeTimer.current); setModalOpen(false); };
  const startClose = () => { closeTimer.current = setTimeout(() => setModalOpen(false), 120); };

  if (!bestseller) {
    return (
      <div className="hero-section" style={{ minWidth: '100%', scrollSnapAlign: 'start', flexShrink: 0, margin: 0, border: 'none', borderRadius: '24px', background: '#0a0a0b', boxSizing: 'border-box' }}>
        <div className="hero-content" style={{ paddingLeft: '8%' }}>
          <h1 className="hero-title">{item.title} <span>{item.titleSpan}</span></h1>
          <p className="hero-subtitle">{item.sub}</p>
          <button className="hero-btn" onClick={() => {
            setCategory(item.id);
            const filterBar = document.querySelector('.filter-bar');
            if (filterBar) window.scrollTo({ top: filterBar.offsetTop - 100, behavior: 'smooth' });
          }}>
            Explore {item.id}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
        <div className="hero-visual" style={{ paddingRight: '8%' }}>
          <div className="hero-visual-glow"></div>
          <img src={item.img} alt={item.id + " Collection"} className="hero-img" />
        </div>
      </div>
    );
  }

  const bId      = bestseller.productId || bestseller.product_id;
  const bName    = bestseller.productName || bestseller.product_name;
  const bImage   = bestseller.imageUrl || bestseller.image_url;
  const bDisc    = bestseller.discountPercent || bestseller.discount_percent || 0;
  const bDesc    = bestseller.description || "";
  const bPrice   = bestseller.price || 0;
  const bFinal   = discounted(bestseller);

  return (
    <>
      <div className="hero-section" style={{ minWidth: '100%', scrollSnapAlign: 'start', flexShrink: 0, margin: 0, border: 'none', borderRadius: '24px', background: '#0a0a0b', boxSizing: 'border-box' }}>
        <div className="hero-content" style={{ paddingLeft: '8%' }}>
          <h1 className="hero-title">{item.title} <span>{item.titleSpan}</span></h1>
          <p className="hero-subtitle">{item.sub}</p>
          <button className="hero-btn" onClick={() => {
            setCategory(item.id);
            const filterBar = document.querySelector('.filter-bar');
            if (filterBar) window.scrollTo({ top: filterBar.offsetTop - 100, behavior: 'smooth' });
          }}>
            Explore {item.id}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        <div className="hero-visual" style={{ paddingRight: '8%', position: 'relative' }}>
          <div className="hero-visual-glow"></div>
          <img src={item.img} alt={item.id + " Collection"} className="hero-img" />

          {/* ── Floating bestseller card — hover opens modal ── */}
          <button
            className="bs-float-card"
            onMouseEnter={openModal}
            onMouseLeave={startClose}
            aria-label={`View bestseller: ${bName}`}
          >
            <span className="bs-float-ring" />

            <img className="bs-float-img" src={bImage} alt={bName} />

            <div className="bs-float-info">
              <p className="bs-float-name">{bName.length > 22 ? bName.substring(0, 22) + '…' : bName}</p>
              <div className="bs-float-prices">
                <span className="bs-float-final">₹{bFinal}</span>
                {bDisc > 0 && <span className="bs-float-orig">₹{bPrice}</span>}
              </div>
            </div>

            {/* Header (badge + discount) at bottom */}
            <div className="bs-float-header">
              <div className="bs-float-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                #1 Best Seller
              </div>
              {bDisc > 0 && <span className="bs-float-disc">{bDisc}% OFF</span>}
            </div>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="bs-modal-overlay" onClick={closeModal}>
          <div
            className="bs-modal"
            onClick={e => e.stopPropagation()}
            onMouseEnter={openModal}
            onMouseLeave={closeModal}
          >
            <button className="bs-modal-close" onClick={closeModal} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="bs-modal-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Best Seller · {item.id}
            </div>

            <div className="bs-modal-body">
              <div className="bs-modal-img-wrap">
                <img src={bImage} alt={bName} className="bs-modal-img" />
                {bDisc > 0 && <span className="bs-modal-disc-badge">-{bDisc}%</span>}
              </div>

              <div className="bs-modal-details">
                <h2 className="bs-modal-name">{bName}</h2>
                <p className="bs-modal-desc">{bDesc}</p>

                <div className="bs-modal-price-row">
                  <span className="bs-modal-final">₹{bFinal}</span>
                  {bDisc > 0 && (
                    <>
                      <span className="bs-modal-orig">₹{bPrice}</span>
                      <span className="bs-modal-save">Save ₹{bPrice - bFinal}</span>
                    </>
                  )}
                </div>

                <Link
                  to={`/product/${bId}`}
                  className="bs-modal-cta"
                  onClick={closeModal}
                >
                  View Product
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}