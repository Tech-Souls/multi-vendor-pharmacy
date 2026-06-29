import React, { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import {
  ArrowRight, HandCoins, Plus, Minus, Check, Heart, CreditCard,
  ShoppingCart, Truck, Headset, Quote,
  Mail, Phone, MapPin, ShieldCheck, Zap, Pill,
  Package, Star, ClipboardList, Users, ChevronLeft, ChevronRight,
  Award, Clock, Thermometer, FileCheck, Sparkles, Layers,
  Target, TrendingUp, BadgeCheck
} from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import API from '../api/axios';


// ─── Social Icons ───
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// ─── Components ───

const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 mb-3 sm:mb-4 tracking-wide uppercase">
    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-600 mr-1.5 sm:mr-2" />
    {children}
  </span>
);

const SectionHeading = ({ eyebrow, title, description, align = 'center' }) => (
  <div className={`mb-8 sm:mb-10 md:mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
      {title}
    </h2>
    {description && (
      <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2 sm:mt-3 leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

const PlaceholderImage = ({ icon: Icon = Package, label = 'No Image' }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center">
      <Icon className="w-5 sm:w-7 h-5 sm:h-7 text-slate-400" />
    </div>
    <span className="text-[8px] sm:text-[10px] font-medium text-slate-400 mt-2 sm:mt-3 tracking-wider uppercase">
      {label}
    </span>
  </div>
);

// ─── Product Card ───
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      await addToCart(product);
      setAdded(true);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const price = product.sellingPrice || product.price || 0;
  const original = product.originalPrice || product.mrp || 0;
  const hasDiscount = original > price && price > 0;
  const discountPct = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;
  const inStock = (product.stock ?? 1) > 0;
  const lowStock = inStock && product.stock <= 5;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-400 flex flex-col overflow-hidden relative"
      onClick={(e) => {
        if (e.target.closest('button')) {
          e.preventDefault();
        }
      }}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" style={{ height: '180px sm:200px md:220px' }}>
        {product.image ? (
          <img
            src={`${BASE_URL}/${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage label={product.category || 'Product'} />
        )}

        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-1.5">
          {hasDiscount && (
            <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm">
              Save {discountPct}%
            </span>
          )}
          {product.category && (
            <span className="text-[7px] sm:text-[9px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-700 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-slate-200/50 shadow-sm">
              {product.category}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-4 group-hover:translate-y-0">
          <button
            onClick={handleAdd}
            disabled={adding || !inStock}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold shadow-lg hover:bg-teal-600 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {added ? (
              <>
                <Check className="w-3 sm:w-4 h-3 sm:h-4" /> Added
              </>
            ) : adding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingCart className="w-3 sm:w-4 h-3 sm:h-4" /> Quick Add
              </>
            )}
          </button>
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-[10px] sm:text-sm bg-red-500/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">Out of Stock</span>
          </div>
        )}
        {lowStock && inStock && (
          <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-3">
            <span className="text-[7px] sm:text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
              Low Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
        <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[8px] sm:text-[10px] text-slate-400 ml-0.5 sm:ml-1">(24)</span>
        </div>

        {product.brand && (
          <p className="text-[8px] sm:text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-0.5 sm:mb-1">
            {product.brand}
          </p>
        )}

        <h3 className="text-[13px] sm:text-[15px] font-semibold text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {product.name}
        </h3>

        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
          SKU: {product.sku || 'N/A'}
        </p>

        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-2">
              <p className="text-base sm:text-xl font-bold text-slate-900">£{Number(price).toFixed(2)}</p>
              {hasDiscount && (
                <p className="text-[11px] sm:text-sm text-slate-400 line-through">£{Number(original).toFixed(2)}</p>
              )}
            </div>
            {hasDiscount && (
              <p className="text-[8px] sm:text-[10px] font-semibold text-green-600">Save {discountPct}%</p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={adding || !inStock}
            className={`h-8 sm:h-10 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 font-bold text-[11px] sm:text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${added
              ? 'bg-teal-600 text-white'
              : 'bg-slate-800 text-white hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-600/20'
              }`}
          >
            {added ? (
              <Check className="w-3 sm:w-4 h-3 sm:h-4" />
            ) : (
              <Plus className="w-3 sm:w-4 h-3 sm:h-4" />
            )}
            {added ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
};

// ─── FAQ Component ───
const faqData = [
  {
    question: "Do I need a validated prescriber account to purchase Prescription-Only Medicines (POM)?",
    answer: "Yes. All Prescription-Only Medicines require clinical validation. Registered GMC, GPhC, NMC, or HCPC prescribers can order directly after professional verification, while non-prescribers must link accounts with their designated prescriber via PrescribeLink.",
  },
  {
    question: "How do you guarantee and verify product authenticity?",
    answer: "All injectables, toxins, and dermal fillers are sourced directly from licensed UK distributors and manufacturers. We operate under strict quality management procedures, maintaining full batch traceability and cold-chain logging.",
  },
  {
    question: "How are temperature-sensitive products like botulinum toxins shipped?",
    answer: "We use validated cold-chain packaging designed to maintain stable, chilled temperatures for up to 72 hours. All toxin shipments are dispatched via next-day delivery partners to guarantee clinical efficacy upon arrival.",
  },
  {
    question: "What is the daily cut-off time for next-day dispatch?",
    answer: "Orders submitted, payment cleared, and prescriptions approved before 3:00 PM Monday through Thursday are processed and shipped for next-working-day delivery.",
  },
  {
    question: "Can I return items if I order the incorrect product by mistake?",
    answer: "Due to MHRA regulations governing professional medical supplies, we cannot accept returns on prescription medications or temperature-sensitive items once they have left our pharmacy premises.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="bg-slate-50/80 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-24 border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          eyebrow="Support & Compliance"
          title="Frequently Asked Questions"
          description="Important information regarding account validation, regulatory compliance, and distribution policies."
        />
        <div className="space-y-2 sm:space-y-3">
          {faqData.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl sm:rounded-2xl transition-all duration-300 border ${openIndex === index
                ? 'bg-white border-teal-200 shadow-md shadow-teal-50/50'
                : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left gap-3 sm:gap-4"
              >
                <span className={`text-sm sm:text-base font-semibold ${openIndex === index ? 'text-slate-900' : 'text-slate-700'}`}>
                  {item.question}
                </span>
                <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                  {openIndex === index
                    ? <Minus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                    : <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40' : 'max-h-0'}`}>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-slate-600 text-xs sm:text-sm leading-relaxed">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Reviews Component ───
const reviews = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Aesthetic Clinic Owner",
    text: "Reliable next-day cold-chain logistics. Our botulinum toxin consignments arrive properly insulated and monitored. The digital signature framework on SwiftRx saves valuable clinic management hours.",
  },
  {
    name: "James Okafor",
    role: "Independent Prescriber",
    text: "PrescribeLink streamlines clinical approval pipelines between prescribers and partner clinics. The compliance controls are highly professional, providing excellent oversight of prescribing files.",
  },
  {
    name: "Lena Fischer",
    role: "Nurse Prescriber",
    text: "The inventory visibility is consistent and transparent. Dispatch notifications include batch numbers and expiry data, which makes clinic stock audits and logging direct and simple.",
  },
];

const Reviews = () => (
  <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 lg:px-24 bg-white border-t border-slate-200">
    <div className="max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Clinical Feedback"
        title="Verified UK Practitioner Reviews"
        description="Providing compliant pharmaceutical distribution and digital prescription tooling for clinics nationwide."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 flex flex-col hover:border-teal-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
          >
            <Quote className="w-6 sm:w-8 h-6 sm:h-8 text-teal-200 mb-3 sm:mb-4" />
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">"{r.text}"</p>
            <div className="flex gap-0.5 mb-2 sm:mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm">
                {r.name.charAt(0)}
              </div>
              <div>
                <p className="text-slate-900 text-xs sm:text-sm font-semibold">{r.name}</p>
                <p className="text-slate-500 text-[10px] sm:text-xs">{r.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Main Home Component ───
const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeStep, setActiveStep] = useState(null);

  const productCategories = [
    { name: 'Botulinum Toxins', count: '45 Products', image: '/1.jpg' },
    { name: 'Dermal Fillers', count: '82 Products', image: '/2.jpg' },
    { name: 'Skin Boosters', count: '34 Products', image: '/3.jpg' },
    { name: 'Fat Dissolvers', count: '28 Products', image: '/4.jpg' },
    { name: 'Consumables', count: '40 Products', image: '/5.jpg' },
  ];

  const heroTrust = ['GPhC Registered Pharmacy', 'Cold-Chain Verified', 'Same-Day Dispatch', 'MHRA Licensed'];

  useEffect(() => {
    fetch(`${BASE_URL}/api/sliders`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSliders(data);
      })
      .catch((err) => console.error("Error setting up homepage hero sliders:", err));
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [sliders]);

  useEffect(() => {
    API.get('/medicines')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.medicines || []);
        setProducts(data.slice(0, 6));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliders.length);

  return (
    <div className="font-sans bg-white text-slate-900">
      <main className="w-full">

        {/* ─── HERO SECTION ─── */}
        <div className="relative overflow-hidden border-b border-slate-200" style={{ minHeight: '420px sm:480px md:520px' }}>

          {sliders.length === 0 ? (
            <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-24 py-10 sm:py-12 md:py-16 flex items-center min-h-[380px sm:420px md:480px]">
              <div className="absolute inset-0">
                <img
                  src="/hero-bg.jpg"
                  alt="Hero background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60" />
              </div>

              <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6">
                    <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-teal-400 rounded-full" />
                    <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-white">Licensed UK Pharmacy</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-white">
                    Premium Aesthetic <br />
                    <span className="text-teal-400">Pharmacy Supply</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed max-w-lg mt-3 sm:mt-4">
                    Log in to your clinic profile to access prescription-only stocks, prepare prescription forms, and coordinate shipping dates.
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <button
                      onClick={() => navigate("/trendpro")}
                      className="group flex items-center gap-2 sm:gap-3 rounded-2xl bg-teal-600 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-[11px] sm:text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                    >
                      Shop Products
                      <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => navigate("/how-it-works")}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-2xl font-bold text-[11px] sm:text-sm border border-white/20 hover:bg-white/20 transition-all duration-300 active:scale-95"
                    >
                      Learn More
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/20 max-w-lg mt-4 sm:mt-6">
                    {heroTrust.map((t) => (
                      <div key={t} className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-white/90">
                        <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-teal-500/30 flex items-center justify-center shrink-0">
                          <Check className="w-2 sm:w-3 h-2 sm:h-3 text-teal-300" />
                        </div>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full relative min-h-[380px sm:420px md:480px]">
              {sliders.map((slide, index) => {
                const isActive = index === currentSlide;
                const formattedImageUrl = slide.imageUrl?.startsWith("http")
                  ? slide.imageUrl
                  : `${BASE_URL}/${slide.imageUrl?.replace(/\\/g, "/")}`;

                return (
                  <div
                    key={slide._id}
                    className={`w-full transition-all duration-700 ease-in-out ${isActive ? "block relative" : "hidden"
                      }`}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={formattedImageUrl}
                        alt={slide.title}
                        className="w-full h-full object-fill"
                        onError={(e) => { e.target.src = "https://placehold.co/1920x600/e2e8f0/475569?text=Pharmacy+Supply"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-slate-900/30" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-24 py-10 sm:py-12 md:py-16 flex items-center min-h-[380px sm:420px md:480px]">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 sm:mb-6">
                          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-teal-400 rounded-full" />
                          <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.15em] text-white">
                            Professional Sourcing · Batch Traceability
                          </p>
                        </div>

                        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] tracking-tight text-white">
                          {slide.title}
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-lg leading-relaxed mt-3 sm:mt-4">
                          {slide.description}
                        </p>

                        <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6">
                          <button
                            onClick={() => navigate(slide.buttonLink || "/trendpro")}
                            className="group flex items-center gap-2 sm:gap-3 rounded-2xl bg-teal-600 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-[11px] sm:text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                          >
                            {slide.buttonText || "Shop Products"}
                            <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                          <button
                            onClick={() => navigate("/trendpro")}
                            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 rounded-2xl font-bold text-[11px] sm:text-sm border border-white/20 hover:bg-white/20 transition-all duration-300 active:scale-95"
                          >
                            View Categories
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-white/20 max-w-lg mt-4 sm:mt-6">
                          {heroTrust.map((t) => (
                            <div key={t} className="flex items-center gap-2 sm:gap-2.5 text-[11px] sm:text-sm font-medium text-white/90">
                              <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-teal-500/30 flex items-center justify-center shrink-0">
                                <Check className="w-2 sm:w-3 h-2 sm:h-3 text-teal-300" />
                              </div>
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sliders.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:bg-white/40 transition-all shadow-lg"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:bg-white/40 transition-all shadow-lg"
                  >
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>

                  <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2.5">
                    {sliders.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-5 sm:w-8 bg-teal-400" : "w-1 sm:w-1.5 bg-white/40"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ─── FEATURED PRODUCTS ─── */}
        <section className="py-10 sm:py-12 md:py-16 bg-white px-4 sm:px-6 md:px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 sm:mb-8 md:mb-10 gap-4 sm:gap-6">
              <div className="flex flex-col items-start flex-1">
                <div className="flex justify-center w-full">
                  <Eyebrow>Clinic Essentials</Eyebrow>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight">
                  Featured Supplies
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-1 sm:mt-2 max-w-lg">
                  Traceable clinic stocks from MHRA-regulated UK distributors
                </p>
              </div>
              <button
                onClick={() => navigate('/trendpro')}
                className="group shrink-0 inline-flex items-center gap-2 sm:gap-3 rounded-2xl bg-slate-800 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3.5 text-[11px] sm:text-sm font-semibold text-white shadow-lg shadow-slate-800/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Catalog
                <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="bg-slate-100" style={{ height: '180px sm:200px md:220px' }} />
                    <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
                      <div className="h-2.5 sm:h-3 bg-slate-100 rounded-full w-3/4" />
                      <div className="h-2.5 sm:h-3 bg-slate-100 rounded-full w-1/2" />
                      <div className="h-5 sm:h-6 bg-slate-100 rounded-full w-1/3 mt-3 sm:mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 sm:py-12 md:py-16 bg-slate-50 rounded-3xl border border-slate-200">
                <Package className="w-12 sm:w-16 h-12 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-slate-500 font-semibold text-sm sm:text-base">No products available yet</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── TRUST SECTION ─── */}
        <section className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8 lg:px-24 bg-slate-800 text-white border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 mb-3 sm:mb-4 tracking-wide uppercase">
                <span className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-teal-400 mr-1.5 sm:mr-2" />
                Quality Assured
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Built for Clinical Excellence
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-2 sm:mt-3">
                Every product meets the highest standards of pharmaceutical regulation and quality assurance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {[
                { icon: ShieldCheck, label: 'Licensed Pharmacy', sub: 'GPhC Registration No. 0000000' },
                { icon: Thermometer, label: 'Cold Chain Verified', sub: 'Temperature-monitored logistics' },
                { icon: Award, label: 'MHRA Licensed', sub: 'Wholesaler Distribution Authorisation' },
                { icon: Clock, label: 'Same-Day Dispatch', sub: 'Cut-off at 3:00 PM' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-2xl border border-white/10 p-4 sm:p-5 md:p-6 hover:bg-white/10 hover:border-teal-400/30 transition-all duration-300"
                >
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-3 sm:mb-4">
                    <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-teal-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">{item.label}</h3>
                  <p className="text-[11px] sm:text-sm text-slate-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── POPULAR CATEGORIES ─── */}
        <section className="py-10 sm:py-12 md:py-16 bg-slate-50/80 px-4 sm:px-6 md:px-8 lg:px-24 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              eyebrow="Inventory Categories"
              title="Product Categories"
              description="Direct wholesale distribution of licensed cosmetic formulations"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {productCategories.map((cat, i) => (
                <div
                  key={i}
                  onClick={() => navigate('/trendpro', { state: { category: cat.name } })}
                  className="group relative bg-white rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer transition-all duration-400 overflow-hidden"
                >
                  <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/400x300/e2e8f0/475569?text=${cat.name.replace(/ /g, '+')}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-0.5">{cat.name}</h3>
                    <p className="text-[10px] sm:text-xs text-white/80 font-medium">{cat.count}</p>
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-teal-300 group-hover:text-teal-200 transition-colors">
                      <span className="text-[10px] sm:text-xs font-semibold">View Products</span>
                      <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURE BAR ─── */}
        <div className="bg-slate-800 border-y border-white/10 px-4 sm:px-6 md:px-8 lg:px-24 py-4 sm:py-5 md:py-6">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-between items-center gap-4 sm:gap-5 md:gap-6 overflow-hidden">
            {[
              { icon: Truck, title: "Free Shipping", sub: "Orders over £199" },
              { icon: ShieldCheck, title: "SSL Encrypted", sub: "Secure Order System" },
              { icon: Zap, title: "Fast Dispatch", sub: "Cut-off at 3:00 PM" },
              { icon: FileCheck, title: "Verified Sourcing", sub: "GPhC/MHRA Supply Chains" },
              { icon: Headset, title: "Clinical Support", sub: "Registered Pharmacists" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 group shrink-0">
                <span className="p-2 sm:p-2.5 bg-teal-500/20 text-teal-300 rounded-xl group-hover:bg-teal-500/30 transition-all duration-300">
                  <f.icon className="w-3 sm:w-4 h-3 sm:h-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-white text-[11px] sm:text-sm">{f.title}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── WHY DRGPHARMA ─── */}
        <section className="py-10 sm:py-12 md:py-16 bg-white px-4 sm:px-6 md:px-8 lg:px-24 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              eyebrow="Pharmacy Standard"
              title="Designed For Clinical Operations"
              description="Supporting clinical safety and supply-chain efficiency for independent UK cosmetic practitioners."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
              <div className="relative">
                <div className="relative w-full h-[280px sm:320px md:380px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img
                    src="/pharmacy-bg.jpg"
                    alt="Licensed UK Pharmacy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/800x500/e2e8f0/475569?text=Licensed+UK+Pharmacy";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                    <p className="text-white text-xs sm:text-sm font-medium">Licensed UK Pharmacy</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                {[
                  { icon: ShieldCheck, title: "Direct Wholesaling", desc: "No grey-market products. Every batch is direct from MHRA-regulated UK supply structures." },
                  { icon: ClipboardList, title: "SwiftRx™ Portal", desc: "Write, sign, and authorize prescriptions digitally without physical documentation hold-ups." },
                  { icon: Users, title: "PrescribeLink Integration", desc: "Allows non-prescribing medical injectors to coordinate clinical oversight with validated prescribers." },
                  { icon: Thermometer, title: "Cold-Chain Control", desc: "A temperature-controlled logistics environment protecting protein structure integrity." },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 md:p-6 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300"
                  >
                    <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      <item.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1 sm:mb-1.5">{item.title}</h3>
                    <p className="text-slate-600 text-[10px] sm:text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-10 sm:py-12 md:py-16 bg-slate-50/80 px-4 sm:px-6 md:px-8 lg:px-24 border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              eyebrow="Clinical Workflow"
              title="Account Validation & Ordering"
              description="A regulatory-compliant structure matching GPhC distribution standards"
            />

            <div className="relative">
              <div className="hidden lg:block absolute top-8 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 md:gap-8 relative">
                {[
                  { num: "01", title: "Practitioner Onboarding", desc: "Complete account sign-up and register professional credentials (GMC, NMC, GPhC, HCPC) for quick validation." },
                  { num: "02", title: "Select Inventory", desc: "Select and secure emergency consumables, skin boosters, dermal fillers, or add POM items to prescription pipelines." },
                  { num: "03", title: "Prescription Sign-off", desc: "Complete clinical prescriptions digitally within the SwiftRx™ portal, or route them via your PrescribeLink partner." },
                  { num: "04", title: "Dispensing & Dispatch", desc: "Our registered UK pharmacy dispatches verified stock in chilled packaging where temperature monitoring is required." },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    onMouseEnter={() => setActiveStep(idx)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    <div className={`w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-white border-2 flex items-center justify-center mb-4 sm:mb-5 relative z-10 transition-all duration-300 ${activeStep === idx
                      ? "border-teal-500 shadow-lg shadow-teal-500/20"
                      : "border-slate-200 group-hover:border-teal-500 group-hover:shadow-lg group-hover:shadow-teal-500/20"
                      }`}
                    >
                      <span className="font-serif text-lg sm:text-xl font-bold text-teal-600">{step.num}</span>
                    </div>
                    <h3 className={`mb-1.5 sm:mb-2 tracking-tight transition-all duration-200
              ${activeStep === idx
                        ? "text-sm sm:text-base font-extrabold text-teal-700"
                        : "text-xs sm:text-sm font-semibold text-slate-900"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className={`leading-relaxed px-1 sm:px-2 transition-all duration-200
              ${activeStep === idx
                        ? "text-[11px] sm:text-sm font-semibold text-slate-700"
                        : "text-[11px] sm:text-sm font-normal text-slate-600"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CUSTOMER REVIEWS ─── */}
        <Reviews />

        {/* ─── FAQ ─── */}
        <FAQ />

        {/* ─── FOOTER ─── */}
        <footer className="bg-slate-900 text-white pt-12 sm:pt-14 md:pt-16 pb-6 sm:pb-7 md:pb-8 px-4 sm:px-6 md:px-8 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">

              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-teal-600 rounded-xl flex items-center justify-center">
                    <Pill className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  DrGPharma
                </div>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Registered clinical supply routes delivering authentic pharmaceuticals, dermal fillers, and clinic-ready injectables across the United Kingdom.
                </p>
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {[
                    { icon: ShieldCheck, text: 'GPhC Registration No. 0000000' },
                    { icon: MapPin, text: 'Registered in England & Wales · Co. No. 00000000' },
                    { icon: Phone, text: '+44 20 0000 0000' },
                    { icon: Mail, text: 'support@drgpharma.com' },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                      <div className="w-6 sm:w-7 h-6 sm:h-7 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={11} className="sm:w-[13px] sm:h-[13px]" />
                      </div>
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-widest">Quick Links</h3>
                <ul className="flex flex-col gap-2 sm:gap-2.5 text-slate-400 text-[11px] sm:text-sm">
                  {[
                    ['/', 'Home'],
                    ['/medicines', 'Medicines'],
                    ['/cart', 'Your Cart'],
                    ['/profile', 'My Account'],
                    ['/login', 'Login'],
                    ['/register', 'Register'],
                  ].map(([to, label]) => (
                    <li key={to}>
                      <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-widest">Pharmacy Services</h3>
                <ul className="flex flex-col gap-2 sm:gap-2.5 text-slate-400 text-[11px] sm:text-sm">
                  {['Online Prescriptions', 'SwiftRx™ Tooling', 'PrescribeLink Accounts', 'Validated Cold Chain', 'Privacy Policy', 'Terms & Conditions'].map(s => (
                    <li key={s}>
                      <span className="hover:text-white transition-colors cursor-pointer">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4">
                <h3 className="text-[10px] sm:text-xs font-semibold text-white uppercase tracking-widest">Stay Connected</h3>
                <p className="text-slate-400 text-[11px] sm:text-sm">Sign up for stock restock alerts, regulatory compliance news, and professional service notifications.</p>
                <div className="flex gap-2 sm:gap-2.5">
                  {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 sm:w-9 h-8 sm:h-9 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:bg-teal-600 hover:text-white transition-all">
                      <Icon />
                    </a>
                  ))}
                </div>

                <div>
                  <h4 className="text-[10px] sm:text-xs font-semibold text-white mb-2 sm:mb-3 uppercase tracking-widest">Newsletter</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                    <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-teal-600 text-white rounded-xl text-[11px] sm:text-sm font-semibold hover:bg-teal-700 transition-all">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pb-4 sm:pb-6 border-b border-white/10">
              {[
                { icon: ShieldCheck, label: 'GPhC Registered' },
                { icon: ShieldCheck, label: 'Secure Checkout' },
                { icon: CreditCard, label: 'Visa' },
                { icon: CreditCard, label: 'Mastercard' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] sm:text-xs font-medium text-slate-300">
                  <Icon className="w-3 sm:w-4 h-3 sm:h-4 text-slate-400" />
                  {label}
                </span>
              ))}
            </div>

            <div className="pt-4 sm:pt-6 flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-3 text-slate-500 text-[10px] sm:text-xs">
              <p>© 2026 DrGPharma. All rights reserved.</p>
              <p>Registered GPhC Pharmacy Premises</p>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default Home;