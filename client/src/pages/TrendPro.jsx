import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ShoppingCart, Check, Star, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from "../api/axios";
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  try {
    let cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) return cleanPath;
    if (cleanPath.startsWith('/')) return cleanPath;
    if (cleanPath.startsWith('uploads/')) return `${baseUrl}/${cleanPath}`;
    return `${baseUrl}/uploads/${cleanPath}`;
  } catch (error) {
    console.error('Error building image URL:', error);
    return null;
  }
};

const TrendPro = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [visible, setVisible] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const sliderRef = useRef(null);

  const categories = ["All", "Botulinum Toxins", "Dermal Fillers", "Skin Boosters", "Fat Dissolvers", "Mesotherapy", "Anesthetics", "Skincare", "Consumables"];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await API.get("/medicines");
        const data = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading products:", error);
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const filteredProducts = selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory);

  useEffect(() => {
    if (!loading && filteredProducts.length) {
      setVisible([]);
      filteredProducts.forEach((_, i) => setTimeout(() => setVisible(prev => [...prev, i]), i * 70));
    }
  }, [loading, selectedCategory, filteredProducts.length]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (added[product._id]) return;
    try {
      await addToCart(product);
      setAdded(prev => ({ ...prev, [product._id]: true }));
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAdded(prev => ({ ...prev, [product._id]: false })), 2000);
    } catch (error) {
      toast.error("Failed to add to cart. Please login first.");
    }
  };

  const SkeletonCard = ({ delay }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse" style={{ animationDelay: `${delay}ms` }}>
      <div className="aspect-square bg-gray-100 rounded-xl mb-4" />
      <div className="h-2.5 bg-gray-100 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-100 rounded mb-1.5" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-5 bg-gray-100 rounded w-16" />
    </div>
  );

  const ProductCard = ({ item, index }) => {
    const isVisible = visible.includes(index);
    const isAdded = added[item._id];
    const price = item.sellingPrice || item.price || 0;
    const originalPrice = item.originalPrice || item.mrp || Math.round(price * 1.1);
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const imageUrl = buildImageUrl(item.image);

    return (
      <div
        onClick={() => navigate(`/product/${item._id}`)}
        className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-green-200 hover:-translate-y-1"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            -{discount}%
          </div>
        )}

        <div className="aspect-square mb-3 sm:mb-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl overflow-hidden p-3 sm:p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-50">
                    <div class="text-center">
                      <svg class="w-8 sm:w-12 h-8 sm:h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p class="text-xs text-gray-400 mt-2">No Image</p>
                    </div>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <svg className="w-8 sm:w-12 h-8 sm:h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400 mt-2">No Image</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
              Quick View
            </span>
          </div>
        </div>

        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 mb-2 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {item.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, idx) => (
            <Star key={idx} className="w-3 h-3 fill-current text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(0)</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {originalPrice > price && (
              <p className="text-xs text-gray-400 line-through">£{Number(originalPrice).toFixed(2)}</p>
            )}
            <p className="text-base sm:text-lg font-bold text-gray-900">£{Number(price).toFixed(2)}</p>
          </div>
          <button
            onClick={(e) => handleAddToCart(e, item)}
            disabled={isAdded}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 active:scale-90 ${isAdded ? 'bg-green-600' : 'bg-gradient-to-r from-slate-800 to-slate-700 hover:shadow-lg hover:scale-110'
              }`}
          >
            {isAdded ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} /> : <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 bg-white font-sans">
      {loading && (
        <div className="h-0.5 bg-gray-100 rounded mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-slate-800 to-slate-900 rounded" style={{ animation: 'loadBar 1.2s ease forwards' }} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Mobile Category Slider with Fade */}
        {/* --- MOBILE CATEGORY SLIDER --- */}
        <div className="lg:hidden mb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-slate-800 rounded-full" />
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Categories</h3>
            </div>
            <span className="text-xs text-gray-400">{categories.indexOf(selectedCategory) + 1} of {categories.length}</span>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all snap-center whitespace-nowrap ${selectedCategory === cat
                    ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg shadow-gray-300/50'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-6 px-2">
              <LayoutGrid className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Categories</h3>
            </div>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex justify-between items-center group ${selectedCategory === cat
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg shadow-gray-300/30'
                      : 'text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 hover:border-l-4 hover:border-cyan-500'
                    }`}
                >
                  {cat}
                  <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 sm:mb-6 lg:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                {selectedCategory === "All" ? "Trending" : selectedCategory} <span className="text-cyan-600">Products</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1 hidden sm:block">{filteredProducts.length} products available</p>
            </div>
            <div className="text-xs text-gray-400 sm:hidden">{filteredProducts.length} products</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {loading
              ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} delay={i * 50} />)
              : filteredProducts.map((item, i) => <ProductCard key={item._id} item={item} index={i} />)}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm">No products found in the "{selectedCategory}" category.</p>
              <button
                onClick={() => setSelectedCategory("All")}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
              >
                View All Products
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes loadBar { from { width: 0%; } to { width: 100%; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
        .scroll-smooth { scroll-behavior: smooth; }
        @media (max-width: 480px) { .grid { gap: 0.75rem; } }
      `}</style>
    </div>
  );
};

export default TrendPro;