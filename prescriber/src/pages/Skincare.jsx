import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { Search, SlidersHorizontal, ChevronRight, ShoppingBag, Package, Filter, X, Kanban } from 'lucide-react';

// Category-specific descriptions
const SUB_META = {
  'Hair': { desc: 'Professional hair restoration and scalp treatment products' },
  'Skincare': { desc: 'Medical-grade skincare formulations for clinical results' },
  'Make Up': { desc: 'Professional cosmetic and corrective makeup products' },
};

// Secondary color palette - warm dark tones
const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2d2d2d',
  accent: '#3d3d3d',
  lightBg: '#f7f6f4',
  cardBg: '#ffffff',
  border: '#e8e6e3',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b6b6b',
  textLight: '#9a9a9a',
  rating: '#f5a623',
};

const Skincare = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const subCategoriesList = ['Hair', 'Skincare', 'Make Up'];
  const [activeSubCategory, setActiveSubCategory] = useState('Skincare');

  const {addToCart} =useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await API.get('/medicines');
        const data = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
        setAllProducts(data);
      } catch (error) {
        console.error('Error loading skincare items:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const products = allProducts.filter(p => {
    const matchCategory = p.category?.toLowerCase() === 'skincare';
    const matchSub = !activeSubCategory || p.subCategory?.toLowerCase() === activeSubCategory.toLowerCase();
    return matchCategory && matchSub;
  });

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (sortKey === 'price-asc') list.sort((a, b) => ((a.sellingPrice || a.price) || 0) - ((b.sellingPrice || b.price) || 0));
    else if (sortKey === 'price-desc') list.sort((a, b) => ((b.sellingPrice || b.price) || 0) - ((a.sellingPrice || a.price) || 0));
    else if (sortKey === 'az') list.sort((a, b) => a.name?.localeCompare(b.name));
    else if (sortKey === 'za') list.sort((a, b) => b.name?.localeCompare(a.name));
    return list;
  }, [products, searchQuery, sortKey]);

  const LOCAL_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23f8f8f8'/><text x='50%' y='50%' font-family='sans-serif' font-size='12' fill='%23ccc' text-anchor='middle' dominant-baseline='middle'>No Image</text></svg>";

  const getProductImage = (imagePath) => {
    if (!imagePath) return LOCAL_PLACEHOLDER;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${imagePath.replace(/\\/g, '/')}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.lightBg }}>
      {/* ─── DARK HERO HEADER ─── */}
      <div style={{ backgroundColor: COLORS.secondary }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Breadcrumb - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2 text-xs mb-3 md:mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={12} />
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/skincare')}>Skincare</span>
            <ChevronRight size={12} />
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{activeSubCategory}</span>
          </div>

          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                Skincare
              </h1>
              <p className="text-xs sm:text-sm mt-1 sm:mt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {SUB_META[activeSubCategory]?.desc || 'Professional skincare products for clinical use.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="font-medium text-white">{filteredProducts.length}</span>
              <span>products</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY TABS ─── */}
      <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.border }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 sm:py-3 scrollbar-hide">
            {subCategoriesList.map((sub) => {
              const isActive = activeSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => { 
                    setActiveSubCategory(sub); 
                    setSearchQuery(''); 
                    setSortKey('default');
                    setShowMobileFilters(false);
                  }}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0
                    ${isActive
                      ? 'text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  style={{
                    backgroundColor: isActive ? COLORS.primary : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Search + Sort - Mobile Friendly */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 md:mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textLight }} />
            <input
              type="text"
              placeholder={`Search ${activeSubCategory}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm rounded-xl focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary,
              }}
            />
          </div>
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all"
            style={{
              backgroundColor: showMobileFilters ? COLORS.primary : COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              color: showMobileFilters ? '#fff' : COLORS.textPrimary,
            }}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">Sort</span>
          </button>

          {/* Desktop Sort Dropdown */}
          <div className="relative hidden sm:block">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLORS.textLight }} />
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="pl-11 pr-10 py-2.5 sm:py-3 text-sm rounded-xl focus:outline-none focus:ring-2 appearance-none cursor-pointer font-medium min-w-[160px]"
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.textPrimary,
              }}
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="az">Name: A → Z</option>
              <option value="za">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* Mobile Sort Dropdown */}
        {showMobileFilters && (
          <div className="sm:hidden mb-4 p-3 rounded-xl animate-slideDown" style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>Sort Products</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={18} style={{ color: COLORS.textSecondary }} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { value: 'default', label: 'Featured' },
                { value: 'price-asc', label: 'Price: Low → High' },
                { value: 'price-desc', label: 'Price: High → Low' },
                { value: 'az', label: 'Name: A → Z' },
                { value: 'za', label: 'Name: Z → A' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortKey(option.value);
                    setShowMobileFilters(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    sortKey === option.value ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: sortKey === option.value ? COLORS.lightBg : 'transparent',
                    color: sortKey === option.value ? COLORS.primary : COLORS.textSecondary,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: COLORS.cardBg }}>
                <div className="aspect-square" style={{ backgroundColor: COLORS.lightBg }} />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: COLORS.lightBg }} />
                  <div className="h-4 rounded" style={{ backgroundColor: COLORS.lightBg }} />
                  <div className="h-4 rounded w-3/4" style={{ backgroundColor: COLORS.lightBg }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 text-center">
            <Package size={40} style={{ color: COLORS.textLight }} />
            <p className="text-base sm:text-lg font-semibold mt-4" style={{ color: COLORS.textSecondary }}>No products found</p>
            <p className="text-sm mt-1" style={{ color: COLORS.textLight }}>
              {searchQuery ? `No results for "${searchQuery}"` : `No products in ${activeSubCategory} yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {/* Product Image */}
                <div
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="relative aspect-square flex items-center justify-center overflow-hidden cursor-pointer p-3 sm:p-4"
                  style={{ backgroundColor: COLORS.lightBg }}
                >
                  <img
                    src={getProductImage(item.image)}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.onerror = null; e.target.src = LOCAL_PLACEHOLDER; }}
                    loading="lazy"
                  />
                </div>

                {/* Product Info */}
                <div className="p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
                  {/* Brand / Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[10px] font-medium uppercase tracking-wider truncate max-w-[60%]" style={{ color: COLORS.textLight }}>
                      {item.brand?.trim() || 'Generic'}
                    </span>
                    <span
                      className="text-[7px] sm:text-[9px] font-medium uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        backgroundColor: COLORS.lightBg,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {item.subCategory || 'Skincare'}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h4
                    onClick={() => navigate(`/product/${item._id}`)}
                    className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2 cursor-pointer hover:opacity-70 transition-opacity min-h-[2rem] sm:min-h-[2.5rem]"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {item.name}
                  </h4>

                  {/* Price + Add Button */}
                  <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-base font-bold" style={{ color: COLORS.textPrimary }}>
                        £{(item.sellingPrice || item.price || 0).toFixed(2)}
                        
                      </span>
                      {item.price && item.sellingPrice && item.sellingPrice < item.price && (
                        <span className="text-[9px] sm:text-xs line-through" style={{ color: COLORS.textLight }}>
                          £{item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                      style={{
                        backgroundColor: COLORS.primary,
                        color: '#ffffff',
                      }}
                    >
                      <ShoppingBag size={12} className="sm:w-[13px] sm:h-[13px]" />
                      <span className="hidden xs:inline">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom styles for scrollbar hiding and animations */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        @media (min-width: 480px) {
          .xs\\:inline {
            display: inline;
          }
        }
        .touch-manipulation {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
};

export default Skincare;



