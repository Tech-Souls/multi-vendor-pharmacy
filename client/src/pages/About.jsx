import React from 'react';
import { 
  ShieldCheck, 
  Scale, 
  Award, 
  HelpCircle, 
  Sparkles, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Package 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 mb-4 tracking-wider uppercase">
    {children}
  </span>
);

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-slate-900 min-h-screen" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* HERO SECTION with Background Image */}
      <section className="relative min-h-[450px] sm:min-h-[500px] md:min-h-[550px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1600&q=80" 
            alt="Modern pharmacy and medical clinic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-teal-300 tracking-wider uppercase">Licensed UK Pharmacy Operations</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Clinical Rigour & <br className="hidden sm:block" />
              <span className="text-teal-400">Sourcing Security</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              DrGPharma provides dedicated technical interfaces and secure, tracked distribution for medical cosmetic injectors, operating in partnership with Time Pharmacy.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center gap-2"
              >
                Get Started 
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-white/20 transition-all"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* PHARMACY PARTNERSHIP */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Eyebrow>Pharmacy Partnership</Eyebrow>
            <h2 
              className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
            >
              Healthcare Time Ltd <br className="hidden sm:block" />
              <span className="text-teal-600">t/a Time Pharmacy</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              All prescription medications (POM) and medical consumables ordered via this platform are reviewed, validated, and dispensed under the strict oversight of our registered pharmacy premises.
            </p>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900">GPhC Registered Premises</span>
                  <p className="font-mono text-xs text-slate-400">Premises Registration Number: 9010453</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-13">
                Fully compliant with the Human Medicines Regulations 2012, operating standard clinical procedures for identity checks and prescription-only safety management.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Regulatory Standards
              </h3>
              
              {[
                { 
                  Icon: Scale, 
                  title: 'FMD Compliance', 
                  desc: 'Every pack features mandatory, serialised security seals preventing grey-market tampering.' 
                },
                { 
                  Icon: ShieldCheck, 
                  title: 'Cold-Chain Tracking', 
                  desc: 'Continuous temperature tracking protects peptide chains from active deterioration during transport.' 
                }
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex gap-4 mb-5 last:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS & OPERATIONS */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
            {[
              { num: '229', label: 'Licensed products available', icon: Package },
              { num: '100%', label: 'FMD-compliant e-prescriptions', icon: ShieldCheck },
              { num: 'GPhC', label: 'Registered pharmacy: 9010453', icon: Award }
            ].map((s, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-700">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div 
                    className="text-3xl sm:text-4xl font-bold text-teal-600"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {s.num}
                  </div>
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* SECTION HEADER */}
          <div className="text-center mb-12">
            <Eyebrow>Operational Standards</Eyebrow>
            <h2 
              className="font-serif text-3xl sm:text-4xl font-bold text-slate-900"
            >
              Traceability and <span className="text-teal-600">Clinical Control</span>
            </h2>
          </div>

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Fully Validated Sourcing', 
                desc: 'We reject secondary grey-market wholesale pipelines. All dermal fillers, consumables, and toxins are sourced directly from validated manufacturers or primary authorised UK distributors.',
                icon: ShieldCheck
              },
              { 
                title: 'Ledger Accountability', 
                desc: 'By integrating order entries with a dynamic financial ledger, we avoid manual bookkeeping errors, keeping input/output tax values and clinical stock numbers verified in real time.',
                icon: Scale
              },
              { 
                title: 'Clinical Verification', 
                desc: 'Our pharmacists independently verify the registration of every prescribing practitioner (GMC, NMC, GPhC, HCPC) before prescription-only orders are prepared for dispatch.',
                icon: Users
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-teal-200 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-700 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION & CONTACT */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Eyebrow>Visit Our Pharmacy</Eyebrow>
            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4">
              Time Pharmacy <span className="text-teal-600">Premises</span>
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p>Healthcare Time Ltd</p>
                  <p>t/a Time Pharmacy</p>
                  <p className="text-slate-400 text-xs mt-1">Registration Number: 9010453</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-600 shrink-0" />
                <span>+44 (0) 20 1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-600 shrink-0" />
                <span>pharmacy@drgpharma.co.uk</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-slate-400 text-xs">Saturday: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-10 h-10 text-teal-600" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">GPhC Registered</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Physical inspections of our dispensing site and licensing registers can be verified via the official General Pharmaceutical Council register.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-700 tracking-wider uppercase">Clinical Inquiries</span>
          </div>
          
          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Have Questions About <span className="text-teal-600">Registration?</span>
          </h3>
          
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            In accordance with regulatory practices, physical inspections can be verified via the official GPhC register.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center justify-center gap-2"
            >
              Contact Us
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-white border-2 border-slate-200 hover:border-teal-300 text-slate-700 font-semibold text-sm px-8 py-3.5 rounded-xl transition-all hover:shadow-md"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Decorative Line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
    </div>
  );
}