import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronDown,
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Home,
  Package,
  FileText,
  Info,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ANNOUNCEMENTS = [
  'Free UK delivery on orders over £99',
  '10% off your first order — use code WELCOME10',
  'Same-day dispatch on orders placed before 2pm',
  'Registered prescribers only · Rx verification required',
];

const AnnouncementBar = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % ANNOUNCEMENTS.length);
        setVisible(true);
      }, 350);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border-b border-gray-100 text-gray-700 text-[11px] font-semibold tracking-wide py-2 px-3 sm:py-2.5 sm:px-4 flex items-center justify-center gap-2 sm:gap-3 select-none relative min-h-[38px] sm:min-h-[44px]">
      <button onClick={() => setIdx(i => (i - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)} className="opacity-30 hover:opacity-70 transition-opacity shrink-0">
        <ChevronLeft size={13} className="w-3 h-3 sm:w-[13px] sm:h-[13px]" />
      </button>
      <p className="text-center transition-all duration-300 px-2 sm:px-4 text-[10px] sm:text-[11px] flex-1 max-w-[600px]" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-4px)' }}>
        {ANNOUNCEMENTS[idx]}
      </p>
      <button onClick={() => setIdx(i => (i + 1) % ANNOUNCEMENTS.length)} className="opacity-30 hover:opacity-70 transition-opacity shrink-0">
        <ChevronRight size={13} className="w-3 h-3 sm:w-[13px] sm:h-[13px]" />
      </button>
      <div className="hidden sm:flex absolute right-4 gap-1.5">
        {ANNOUNCEMENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`rounded-full transition-all ${i === idx ? 'w-3 h-1.5 bg-gray-800' : 'w-1.5 h-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

const HomeHeader = () => {
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await API.get('/medicines');
      const all = Array.isArray(res.data) ? res.data : res.data?.medicines || [];
      const q = query.toLowerCase();
      const filtered = all
        .filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
        .slice(0, 5);
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const productCategories = ['Botulinum Toxins', 'Dermal Fillers', 'Skin Boosters', 'Fat Dissolvers', 'Consumables'];

  const handleCategoryClick = (cat) => {
    setActiveNav('products');
    setShowProductsMenu(false);
    navigate('/trendpro', { state: { category: cat } });
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const navLinks = [
    { key: 'home', to: '/home', icon: <Home size={13} />, label: 'Home' },
    { key: 'products', to: '/trendpro', icon: <Package size={13} />, label: 'Products', hasDropdown: true },
    { key: 'prescription', to: '/prescription-form', icon: <FileText size={13} />, label: 'Prescription' },
    { key: 'howItWorks', to: '/how-it-works', icon: <Sparkles size={13} />, label: 'How It Works' },
    { key: 'about', to: '/about', icon: <Info size={13} />, label: 'About Us' },
    { key: 'contact', to: '/contact', icon: <Mail size={13} />, label: 'Contact' },
  ];

  return (
    <>
      <AnnouncementBar />

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-sm flex flex-col items-center pt-20 sm:pt-24 px-4" onClick={(e) => { if (e.target === e.currentTarget) closeSearch(); }}>
          <button onClick={closeSearch} className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white/60 hover:text-white transition-colors">
            <X size={24} className="sm:w-7 sm:h-7" />
          </button>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-4 sm:mb-6">Search Products</p>
          <div className="w-full max-w-xl relative">
            <div className="flex items-center border-b-2 border-white/30 focus-within:border-white transition-colors pb-2">
              <Search size={18} className="sm:w-5 sm:h-5 text-white/40 mr-3 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type to search..."
                className="flex-1 bg-transparent text-white text-base sm:text-lg outline-none placeholder-white/30"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-white/40 hover:text-white ml-2">
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                {searchResults.map(item => (
                  <div
                    key={item._id}
                    onClick={() => { closeSearch(); navigate(`/medicine/${item._id}`); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none transition-colors"
                  >
                    <Search size={13} className="text-white/30 shrink-0" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-white/40 text-xs">£{item.sellingPrice || item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-[200] transition-all duration-300 ${isScrolled ? 'shadow-2xl shadow-slate-900/30' : ''}`} style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div className="bg-gradient-to-r from-[#0f1a2e] to-[#1a2a45] border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8 lg:px-12 h-[60px] sm:h-[64px] md:h-[72px] flex items-center gap-2 sm:gap-4 md:gap-6">

            {/* Logo - Left Section */}
            <Link to="/home" onClick={() => setActiveNav('home')} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 border border-white/10 flex items-center justify-center shadow-lg shadow-teal-900/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]">
                  <rect x="10" y="3" width="4" height="18" rx="2" fill="rgba(255,255,255,0.95)" />
                  <rect x="3" y="10" width="18" height="4" rx="2" fill="rgba(255,255,255,0.95)" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight">DrG</span>
                  <span className="text-sm sm:text-base md:text-lg font-light text-white/40 tracking-tight">Pharma</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-teal-900/20 border border-teal-800/30 rounded-full px-2 py-0.5">
                  <div className="w-1 h-1 rounded-full bg-teal-500" />
                  <span className="text-[6px] font-bold text-teal-500 tracking-[0.2em] uppercase">Aesthetic Pharmacy</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Center Section with tighter spacing */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-4">
              <div className="flex items-center gap-0.5 bg-white/5 rounded-xl px-1 py-1 border border-white/5">
                {navLinks.map((link) => {
                  if (link.hasDropdown) {
                    return (
                      <div key={link.key} className="relative" onMouseEnter={() => setShowProductsMenu(true)} onMouseLeave={() => setShowProductsMenu(false)}>
                        <Link
                          to={link.to}
                          onClick={() => setActiveNav(link.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeNav === link.key
                              ? 'text-white bg-white/20'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        >
                          {link.icon} {link.label}
                          <ChevronDown size={11} className={`transition-transform duration-300 ${showProductsMenu ? 'rotate-180 opacity-100' : 'opacity-40'}`} />
                        </Link>
                        {showProductsMenu && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl min-w-[210px] border border-gray-200 shadow-2xl overflow-hidden z-[1000]">
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Categories</span>
                            </div>
                            {productCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => { handleCategoryClick(cat); setShowProductsMenu(false); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-gray-900 transition-all text-left border-none bg-transparent cursor-pointer"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
                                {cat}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={link.key}
                      to={link.to}
                      onClick={() => setActiveNav(link.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeNav === link.key
                          ? 'text-white bg-white/20'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {link.icon} {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Actions - Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto flex-shrink-0">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
              >
                <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>

              {/* Auth - Desktop */}
              <div className="hidden sm:flex items-center gap-1 md:gap-2">
                {isLoggedIn ? (
                  <>
                    <span className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/80 text-xs font-medium">
                      <User size={12} className="sm:w-[13px] sm:h-[13px]" /> {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
                    >
                      <LogOut size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-medium no-underline"
                    >
                      <LogIn size={12} className="sm:w-[13px] sm:h-[13px]" /> <span className="hidden sm:inline">Login</span>
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-teal-500/20 border border-white/10 text-white hover:bg-teal-500/30 transition-all text-xs font-semibold no-underline shadow-lg shadow-black/5"
                    >
                      <UserPlus size={12} className="sm:w-[13px] sm:h-[13px]" /> <span className="hidden sm:inline">Register</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all no-underline"
              >
                <div className="relative">
                  <ShoppingCart size={15} className="sm:w-[17px] sm:h-[17px] text-white" strokeWidth={1.8} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-[7px] font-extrabold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-1 border-2 border-[#1a2a45] sm:min-w-[16px] sm:h-[16px] sm:text-[8px] sm:border-2">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-white text-[11px] sm:text-xs font-bold tracking-wide">Cart</span>
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all border-none bg-transparent cursor-pointer"
              >
                {mobileMenuOpen ? <X size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Menu size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {/* Mobile Menu - Simplified */}
          {mobileMenuOpen && (
            <div className="lg:hidden px-4 sm:px-6 py-4 border-t border-white/5 bg-[#0f1a2e]/95">
              <div className="sm:hidden flex items-center gap-2 px-3 py-3 border-b border-white/5 mb-2">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white/80 text-sm font-medium"><User size={14} className="inline mr-2" />{user?.name?.split(' ')[0] || 'User'}</span>
                    <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm flex items-center gap-1"><LogOut size={14} /> Logout</button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-white/70 hover:text-white text-sm font-medium py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">Login</Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-white font-medium py-2 px-4 rounded-lg bg-teal-600/30 hover:bg-teal-600/40 transition-colors">Register</Link>
                  </>
                )}
              </div>

              {/* All links as simple navigation - no dropdowns in mobile */}
              {navLinks.map(link => (
                <Link
                  key={link.key}
                  to={link.to}
                  onClick={() => {
                    setActiveNav(link.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-lg transition-all text-sm font-medium no-underline ${activeNav === link.key ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default HomeHeader;