import React, { useEffect, useState, useRef } from 'react';
import {
  ShoppingCart, Truck, ShieldCheck, RefreshCw, Headphones,
  Star, ChevronRight, Heart, Zap, Award, Users, ArrowRight,
  CheckCircle, Clock, Package, ChevronLeft, Film, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import TrendPro from './TrendPro';

const PLACEHOLDER_150 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23cbd5e1">Image</text></svg>`;
const PLACEHOLDER_HERO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" fill="%23cbd5e1">Pharmacy Supplies</text></svg>`;

// ── Intersection Observer hook for scroll animations ──────────
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── Feature card ──────────────────────────────────────────────
const Feature = ({ icon, title, desc, delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 text-white">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 font-semibold text-xs mt-0.5">{desc}</p>
      </div>
    </div>
  );
};

// ── Product card ──────────────────────────────────────────────
const ProductCard = ({ item, onAdd, delay = 0 }) => {
  const [ref, inView] = useInView();
  const [wished, setWished] = useState(false);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
        <img
          src={item.image ? (item.image.startsWith('http') ? item.image : (item.image.startsWith('uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${item.image}` : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads/${item.image}`)) : PLACEHOLDER_150}
          alt={item.name}
          className="max-h-[75%] object-contain group-hover:scale-110 transition-transform duration-700"
          onError={e => { e.target.src = PLACEHOLDER_150; }}
        />
        {/* Wishlist */}
        <button
          onClick={() => setWished(w => !w)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${wished ? 'bg-red-500 text-white scale-110' : 'bg-white text-gray-400 hover:text-red-400 shadow'}`}
        >
          <Heart size={14} fill={wished ? 'currentColor' : 'none'} />
        </button>
        {/* Badge */}
        {item.stock <= 5 && item.stock > 0 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Low Stock
          </span>
        )}
      </div>
      <div className="p-5">
        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
        </div>
        <h3 className="font-bold text-gray-800 mb-1 truncate text-sm">{item.name}</h3>
        {item.category && <p className="text-xs text-gray-400 mb-3">{item.category}</p>}
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-gray-900">
            £{(item.sellingPrice || item.price || 0).toFixed(2)}
          </span>
          <button
            onClick={() => onAdd(item)}
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat counter ──────────────────────────────────────────────
const StatCard = ({ value, label, icon: Icon, delay = 0 }) => {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
        <Icon size={22} className="text-gray-900" />
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
const Home = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [mediaItems, setMediaItems] = useState([]); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const { addToCart } = useCart();
  
  const sliderRef = useRef(null); 
  const trendProSliderRef = useRef(null); 
  const [whyRef, whyInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [mediaRef, mediaInView] = useInView();
  const [videoSectionRef, videoSectionInView] = useInView();

  const [posts, setPosts] = useState([]);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Close lightbox on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx(i => i !== null ? (i + 1) % posts.length : null);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i !== null ? (i - 1 + posts.length) % posts.length : null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [posts.length]);

  // Mouse Drag to Scroll Tracking States
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftState = useRef(0);


  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);

    API.get('/medicines')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.medicines || []);
        setTopProducts(data.slice(0, 6));
      })
      .catch(console.error);

    API.get('/sliders')
      .then(res => {
        if (Array.isArray(res.data)) {
          setSliders(res.data);
        }
      })
      .catch(err => console.error("Error loading sliders:", err));

    API.get('/media') 
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data.media || []);
        setMediaItems(data);
      })
      .catch(err => console.error("Error fetching media items records:", err));

      API.get('/posts')
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setPosts(data);
    })
    .catch(err => console.error("Error fetching posts:", err));
  }, []);
    

  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliders]);

  const handleQuickAdd = async (product) => {
    try {
      await addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error('Please login to add items');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      sliderRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  const scrollTrendPro = (direction) => {
    if (trendProSliderRef.current) {
      const offset = direction === 'left' ? -450 : 450;
      trendProSliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    isDown.current = true;
    trendProSliderRef.current.classList.add('active');
    startX.current = e.pageX - trendProSliderRef.current.offsetLeft;
    scrollLeftState.current = trendProSliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - trendProSliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; 
    trendProSliderRef.current.scrollLeft = scrollLeftState.current - walk;
  };

  // Filter video elements dynamically
  const videoItems = mediaItems.filter(item => 
    item.mediaType === 'video' || 
    (item.image && /\.(mp4|mov|webm)$/i.test(item.image))
  );

  // Filter image elements dynamically for the marquee
  const imageItems = mediaItems.filter(item => 
    item.mediaType === 'image' || 
    (item.image && !/\.(mp4|mov|webm)$/i.test(item.image))
  );

  return (
    <div className="bg-white overflow-x-hidden">

   
     {/* ── 1. DYNAMIC HERO SLIDER SECTION ── */}
      <section className="min-h-[80vh]  relative overflow-hidden flex items-center">
        {sliders.length === 0 && (
        <div className="relative w-full h-[80vh] min-h-[480px] bg-black flex items-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=80"
            alt="DoctorG Clinic"
            className="absolute inset-0 w-full h-full object-cover opacity-25 select-none"
          />
          <div className="relative z-10 text-white px-8 md:px-20 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-4">
              Professional Aesthetic Medicine
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
              Premium<br />Clinical Supply
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              Exclusive access to regulated aesthetic medicines and premium skincare for registered healthcare professionals.
            </p>
            <Link
              to="/trendpro"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-bold text-sm hover:bg-gray-200 transition"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {sliders.length > 0 && (
          <div className="w-full relative h-[80vh] flex items-center">
            {sliders.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute inset-0 w-full h-full flex items-center transition-all duration-1000 ease-in-out px-8 md:px-20 ${
                  index === currentSlide ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'
                }`}
              >
                <div className="absolute inset-0 w-full h-full z-0">
                  <img
                    src={slide.imageUrl ? (slide.imageUrl.startsWith('http') ? slide.imageUrl : (slide.imageUrl.startsWith('uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${slide.imageUrl}` : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads/${slide.imageUrl}`)) : PLACEHOLDER_HERO}
                    alt={slide.title}
                    className="w-full h-full object-fill select-none"
                    onError={(e) => { e.target.src = PLACEHOLDER_HERO; }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <div className="text-white z-10 text-left space-y-4 max-w-lg relative">
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-white text-xs md:text-sm leading-relaxed max-w-sm">
                    {slide.description}
                  </p>
                  
                  {slide.buttonText && (
                    <div className="pt-2">
                      {slide.buttonLink?.startsWith('http') ? (
                        <a
                          href={slide.buttonLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-300 transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                          {slide.buttonText} <ArrowRight size={15} />
                        </a>
                      ) : (
                        <Link
                          to={slide.buttonLink || "/trendpro"}
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                          {slide.buttonText} <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sliders.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 z-20 p-2.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all border border-white/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 z-20 p-2.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all border border-white/10"
                >
                  <ChevronRight size={20} />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {sliders.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ── 2. FEATURES MARQUEE ── */}
      <section className="py-4 bg-white text-black overflow-hidden border-b border-gray-100 select-none relative">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 25s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="flex whitespace-nowrap">
          <div className="animate-marquee flex items-center gap-16 text-md font-semibold tracking-wide">
            <span>Free delivery on orders over £400</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Exclusive Brands</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Multi Award Winning</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Skincare</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Market Leading Distribution</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Fat Dissolvers</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Botulinum Toxins</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />

            <span>Free delivery on orders over £400</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Exclusive Brands</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Multi Award Winning Market Leading Distribution</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Skincare</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Fat Dissolvers</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            <span>Botulinum Toxins</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── TRENDPRO CAROUSEL SECTION WITH DRAG SCROLLING ── */}
      <section className="py-16 px-6 md:px-20 relative select-none">
        <div className="max-w-7xl mx-auto relative">
          <div 
            ref={trendProSliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="overflow-x-auto cursor-grab active:cursor-grabbing select-none w-full scrollbar-none"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex flex-row gap-6 pb-4 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&>*]:shrink-0 [&_div]:shrink-0">
              <TrendPro isHomePage={true} />
            </div>
          </div>

          <style>{`
            div::-webkit-scrollbar {
              display: none !important;
            }
          `}</style>
        </div>
      </section>

      {/* ── 3. CATEGORY TILES ── */}
      <section className="py-16 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-2">Browse by Category</p>
            <h2 className="text-3xl font-black tracking-tight">Shop Our Range</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: '/largetile_hainjectables-BTwIh-s7.jpg', label: 'HA Injectables', sub: 'Fillers & Boosters', to: '/injectables' },
              { src: '/largetile_regensolutions-BDJZDg5h.jpg', label: 'Regen Solutions', sub: 'Polynucleotides & Biostimulators', to: '/injectables' },
              { src: '/largetile_toxins-CsZ2azkv.jpg', label: 'Toxins', sub: 'Botulinum Toxin Range', to: '/injectables' },
            ].map(({ src, label, sub, to }) => (
              <Link key={label} to={to}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] bg-gray-900 block">
                <img src={src} alt={label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300 mb-1">{sub}</p>
                  <h3 className="text-xl font-black text-white mb-3">{label}</h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white border border-white/40 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-black transition-all duration-300">
                    Shop Now <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND LOGOS ── */}
      <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
        <style>{`
          @keyframes brandScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .brand-text-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: brandScroll 28s linear infinite;
          }
          .brand-text-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="overflow-hidden">
          <div className="brand-text-track gap-0">
            {[
              'ALLERGAN AESTHETICS', 'GALDERMA', 'TEOXANE', 'MERZ AESTHETICS',
              'SINCLAIR PHARMA', 'PROLLENIUM', 'HUGEL', 'REVANCE', 'IPSEN',
              'Q-MED', 'CROMA PHARMA', 'FILLMED',
              'ALLERGAN AESTHETICS', 'GALDERMA', 'TEOXANE', 'MERZ AESTHETICS',
              'SINCLAIR PHARMA', 'PROLLENIUM', 'HUGEL', 'REVANCE', 'IPSEN',
              'Q-MED', 'CROMA PHARMA', 'FILLMED',
            ].map((name, i) => (
              <div key={i} className="flex items-center shrink-0">
                <span className="text-[11px] font-black tracking-[0.35em] text-gray-800 px-7 whitespace-nowrap hover:text-black transition-colors cursor-default">
                  {name}
                </span>
                <span className="text-gray-200 text-lg shrink-0">·</span>
              </div>
            ))}
          </div>
        </div>
      </section>

  
      <section ref={mediaRef} className="py-12 px-6 md:px-20 bg-white select-none overflow-hidden">
        <div
          className={`max-w-7xl mx-auto relative transition-all duration-1000 ${
            mediaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {mediaItems.length === 0 ? (
            <div className="py-12 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-400 font-medium">
                No custom dashboard images uploaded yet.
              </p>
            </div>
          ) : (
            <>
              <style>{`
                @keyframes scrollLeft {
                  0%   { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .auto-scroll-track {
                  display: flex;
                  gap: 12px;
                  width: max-content;
                  animation: scrollLeft 20s linear infinite;
                }
                .auto-scroll-track:hover {
                  animation-play-state: paused;
                }
              `}</style>

              <div className="overflow-hidden w-full">
                <div className="auto-scroll-track">
                  {[...imageItems, ...imageItems].map((item, i) => (
                    <div
                      key={`${item._id}-${i}`}
                      className="w-[80px] sm:w-[100px] md:w-[110px] shrink-0 overflow-hidden group"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl">
                        <img
                          src={item.imageUrl || item.image ? ((item.imageUrl || item.image).startsWith('http') ? (item.imageUrl || item.image) : ((item.imageUrl || item.image).startsWith('uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${item.imageUrl || item.image}` : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/uploads/${item.imageUrl || item.image}`)) : PLACEHOLDER_150}
                          alt={item.title || 'Uploaded Update'}
                          className="w-[600px] h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_150;
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 5. VIDEOS SECTION ── */}
      <section ref={videoSectionRef} className="py-20 px-6 md:px-20 bg-black text-white">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${videoSectionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-2">Our Work</p>
              <h2 className="text-3xl font-black tracking-tight">Clinic Showcase</h2>
            </div>
            <a href="https://www.instagram.com/drgclinics?igsh=eDUzMGczc29lY3Jr"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/60 px-5 py-2.5 rounded-full transition-all duration-300">
              @drgclinics on Instagram <ArrowRight size={13} />
            </a>
          </div>

          {videoItems.length === 0 ? (
            <div className="py-20 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
              <Film className="text-white/20 mb-3" size={36} />
              <p className="text-sm text-white/30 font-medium">No showcase videos uploaded yet</p>
              <p className="text-xs text-white/20 mt-1">Upload videos via the prescriber dashboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {videoItems.slice(0, 3).map((video) => (
                <div key={video._id}
                  className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50">
                  <div className="relative aspect-[9/16]">
                    <video
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${video.image}`}
                      className="w-full h-full object-cover"
                      muted loop autoPlay playsInline
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-white/80">{video.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* ── 6. POSTS SECTION ── */}
<section className="py-16 px-6 md:px-20 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 mb-1">From Our Clinic</p>
        <h2 className="text-2xl font-black tracking-tight">Latest Updates</h2>
      </div>
      <a href="https://www.instagram.com/drgclinics" target="_blank" rel="noopener noreferrer"
        className="text-xs font-bold text-black border-b border-black hover:border-gray-400 hover:text-gray-500 transition-colors pb-0.5">
        Follow on Instagram ↗
      </a>
    </div>

    {posts.length === 0 ? (
      <p className="text-gray-400 text-sm">No posts uploaded yet</p>
    ) : (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {posts.map((post, idx) => (
            <div key={post._id}
              onClick={() => setLightboxIdx(idx)}
              className="group relative overflow-hidden aspect-square bg-gray-100 cursor-pointer">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${post.image}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={post.title || 'Post'}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">View</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── LIGHTBOX ── */}
        {lightboxIdx !== null && (
          <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setLightboxIdx(null); }}>
            {/* Close */}
            <button onClick={() => setLightboxIdx(null)}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10">
              <X size={20} />
            </button>
            {/* Counter */}
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-white/40 font-medium tracking-widest">
              {lightboxIdx + 1} / {posts.length}
            </p>
            {/* Prev */}
            <button
              onClick={() => setLightboxIdx((lightboxIdx - 1 + posts.length) % posts.length)}
              className="absolute left-4 md:left-8 w-11 h-11 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10">
              <ChevronLeft size={22} />
            </button>
            {/* Image */}
            <img
              key={lightboxIdx}
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${posts[lightboxIdx].image}`}
              alt={posts[lightboxIdx].title || 'Post'}
              className="max-h-[85vh] max-w-[90vw] md:max-w-[70vw] object-contain select-none"
            />
            {/* Next */}
            <button
              onClick={() => setLightboxIdx((lightboxIdx + 1) % posts.length)}
              className="absolute right-4 md:right-8 w-11 h-11 flex items-center justify-center text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10">
              <ChevronRight size={22} />
            </button>
            {/* Dot strip */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {posts.map((_, i) => (
                <button key={i} onClick={() => setLightboxIdx(i)}
                  className={`rounded-full transition-all duration-200 ${i === lightboxIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`} />
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>
</section>

    </div>
  );
};

export default Home;