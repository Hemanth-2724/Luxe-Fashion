import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../api";
import Navbar from "../component/Navbar";

const CATEGORIES = ["All", "Women", "Men", "Kids", "Accessories"];

export default function Products() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(r => r.json())
      .then(data => {
        // Shuffle the array for random order on each load
        const shuffled = data.sort(() => Math.random() - 0.5);
        setProducts(shuffled);
      })
      .catch(() => {
        // UI fallback
        const fallbackData = [
          { productId: 1, productName: "Floral Wrap Dress",   price: 1299, discountPercent: 10, description: "Elegant summer wrap dress with floral pattern.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", categoryName: "Women", gender_category: "Women" },
          { productId: 2, productName: "Casual Denim Jacket", price: 1899, discountPercent: 15, description: "Classic blue denim jacket for everyday wear.",    imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", categoryName: "Women", gender_category: "Women" },
          { productId: 3, productName: "Slim Fit Chinos",     price: 999,  discountPercent: 5,  description: "Modern slim fit chino pants in neutral tones.", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", categoryName: "Men", gender_category: "Men"   },
          { productId: 4, productName: "Oxford Button Shirt", price: 1199, discountPercent: 0,  description: "Classic oxford cotton shirt for refined look.",  imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", categoryName: "Men", gender_category: "Men"   },
          { productId: 5, productName: "Maxi Boho Skirt",     price: 799,  discountPercent: 20, description: "Bohemian style maxi skirt with vibrant prints.", imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a7?w=400", categoryName: "Women", gender_category: "Women" },
          { productId: 6, productName: "Kids Printed Tee",    price: 399,  discountPercent: 0,  description: "Colorful printed t-shirt in soft cotton.",       imageUrl: "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=400", categoryName: "Kids", gender_category: "Kids"  },
        ];
        const shuffledFallback = fallbackData.sort(() => Math.random() - 0.5);
        setProducts(shuffledFallback);
      })
      .finally(() => setLoading(false));
  }, []);

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
            <div key={item.id} className="hero-section" style={{ minWidth: '100%', scrollSnapAlign: 'start', flexShrink: 0, margin: 0, border: 'none', borderRadius: '24px', background: '#0a0a0b', boxSizing: 'border-box' }}>
              <div className="hero-content" style={{ paddingLeft: '8%' }}>
                <h1 className="hero-title">{item.title} <span>{item.titleSpan}</span></h1>
                <p className="hero-subtitle">{item.sub}</p>
                <button className="hero-btn" onClick={() => {
                  setCategory(item.id);
                  const filterBar = document.querySelector('.filter-bar');
                  if (filterBar) {
                    window.scrollTo({
                      top: filterBar.offsetTop - 100,
                      behavior: 'smooth'
                    });
                  }
                }}>
                  Explore {item.id}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
              <div className="hero-visual" style={{ paddingRight: '8%' }}>
                <div className="hero-visual-glow"></div>
                <img 
                  src={item.img} 
                  alt={item.id + " Collection"} 
                  className="hero-img" 
                />
              </div>
            </div>
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