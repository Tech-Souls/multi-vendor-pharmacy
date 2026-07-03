import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Link as LinkIcon, UserCheck,
  Truck, Coins, AlertCircle, ArrowRight, CheckCircle2,
  ChevronRight, Sparkles, Users, Clock, Calendar
} from 'lucide-react';

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 mb-4 tracking-wider uppercase">
    {children}
  </span>
);

export default function HowItWorks() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prescriber');

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      
      {/* HERO SECTION with Background Image */}
      <section className="relative h-[478px] sm:h-[528px] md:h-[578px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="./howitworks.jpg" 
            alt="Medical professionals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 md:ml-[100px]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-teal-300 tracking-wider uppercase">Workflows & Architecture</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              How DrGPharma <br className="hidden sm:block" />
              <span className="text-teal-400">Works</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              A compliant, dual-track platform for aesthetic prescribers and clinic operators, backed by automated pharmacy fulfillment.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/trendpro')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-white/20 transition-all"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 1: CLINICAL PATHS */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Eyebrow>Clinical Access Scenarios</Eyebrow>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Select Your Clinical <span className="text-teal-600">Registration Type</span>
          </h2>
          <p className="text-slate-500 text-sm mt-3 max-w-2xl mx-auto">
            Our workflows adapt to your independent prescribing status to ensure full MHRA & GPhC compliance.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('prescriber')}
              className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'prescriber'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Verified Prescriber
              </span>
            </button>
            <button
              onClick={() => setActiveTab('non-prescriber')}
              className={`px-6 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'non-prescriber'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Non-Prescriber
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm">
              <span className="w-6 h-0.5 bg-teal-600" />
              {activeTab === 'prescriber' ? 'SwiftRx™ Direct Prescribing' : 'PrescribeLink™ Practitioner Bridge'}
            </div>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              {activeTab === 'prescriber' 
                ? 'SwiftRx™ Direct Prescribing' 
                : 'PrescribeLink™ Practitioner Bridge'
              }
            </h3>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              {activeTab === 'prescriber'
                ? 'Registered GMC, NMC, GPhC, or GDC practitioners with independent prescribing authority (V300 or equivalent) can issue compliant digital prescriptions in under 2 minutes.'
                : 'Aesthetic therapists and non-prescribing injectors can source prescription items (POM) by linking with a verified prescriber on our network.'
              }
            </p>

            <ul className="space-y-4">
              {(activeTab === 'prescriber' 
                ? [
                    { title: "Identify Patient Details", desc: "Input demographics, allergen profiles, and clinical contraindications directly into the form." },
                    { title: "Select Product Class", desc: "Select prescription items (POM) such as botulinum toxins or standard-rated injectables." },
                    { title: "Compliant Digital Sign-Off", desc: "Submit the secure, paperless prescription directly to our pharmacy team." },
                    { title: "Auto-Linked Checkout", desc: "Proceed immediately to secure payment; orders are queued automatically for dispensing." }
                  ]
                : [
                    { title: "Register Clinic Profile", desc: "Submit your professional credentials (GDC, NMC, etc.) for registration validation." },
                    { title: "Link with a Registered Prescriber", desc: "Send an association request to your independent prescriber's inbox via PrescribeLink™." },
                    { title: "Submit Rx Requests", desc: "Provide required patient consulting documentation, consent files, and clinical logs." },
                    { title: "Prescriber Sign-off & Payment", desc: "Once authorized by your linked prescriber, clear the balance to trigger immediate fulfillment." }
                  ]
              ).map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-500">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Feature Card */}
          <div className="order-1 lg:order-2">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                  {activeTab === 'prescriber' ? <UserCheck className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeTab === 'prescriber' ? 'Prescribing Capabilities' : 'Bridge Framework'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                    {activeTab === 'prescriber' ? 'WORKFLOW: SWIFTRX_DIRECT' : 'WORKFLOW: PRESCRIBELINK_BRIDGE'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3.5">
                {(activeTab === 'prescriber'
                  ? [
                      "Direct prescribing of POM & OTC lines",
                      "Customizable prescription validity terms",
                      "Integrated, FMD-compliant patient logs",
                      "Automatic wholesale pre-order triggers"
                    ]
                  : [
                      "Supports multiple concurrent prescriber links",
                      "Secure patient consent file uploading (PDF, PNG)",
                      "Independent checkout and delivery coordination",
                      "Comprehensive, compliant audit-trail logging"
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {activeTab === 'prescriber'
                    ? '* All clinical profiles are audited against active public registers prior to the authorization of prescription-only orders.'
                    : '* Non-prescribers cannot order or checkout POM products without active prescriber validation and clinical sign-off.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FULFILLMENT & ONE-POT MODEL */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow>Ledger Integration</Eyebrow>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              One-Pot Financial & <span className="text-teal-600">Inventory Framework</span>
            </h2>
            <p className="text-slate-600 text-sm mt-3 max-w-xl mx-auto">
              How our system tracks every order, stock movement, and VAT adjustment within a single ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                title: "Real-Time Balance Division",
                desc: "The platform segregates your actual cash position from restricted funds (such as VAT obligations owed to HMRC), meaning your available spend is calculated with total precision."
              },
              {
                icon: ShieldCheck,
                title: "Product-Specific VAT Logic",
                desc: "Toxins (such as Azzalure) dispensed against valid medical prescriptions are processed as zero-rated, while other injectables are standard-rated. The ledger tracks input-output VAT variances instantly."
              },
              {
                icon: Truck,
                title: "Flexible Fulfillment Modes",
                desc: "Orders are handled as either shelf stock, pre-ordered wholesale items, or hybrid splits. The ledger adjusts your physical asset valuation the moment a parcel leaves the warehouse."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-teal-200 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-700 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: COLD-CHAIN CUSTODY */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[260px] h-[260px] bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-1.5">
              <AlertCircle className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-teal-300 tracking-wider uppercase">Cold-Chain Safety Note</span>
            </div>
            
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Preserving Formulation Activity
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Botulinum toxins and specific GLP-1 weight-management treatments are strictly temperature-sensitive. To protect product safety and comply with pharmacy standards, these items require validated, temperature-controlled packaging.
            </p>
            
            <div className="flex items-start gap-3 bg-white/5 border border-teal-500/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Chilled products are packaged in validated insulated containers containing logged coolant packs. Orders containing cold-chain items are shipped exclusively via tracked next-day delivery (Monday through Thursday) to guarantee safe arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-teal-700 tracking-wider uppercase">Join Our Community</span>
          </div>
          
          <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Ready to Begin <span className="text-teal-600">Clinical Ordering?</span>
          </h3>
          
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Access secure, compliant, and tracked prescription medical distribution today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center justify-center gap-2"
            >
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white border-2 border-slate-200 hover:border-teal-300 text-slate-700 font-semibold text-sm px-8 py-3.5 rounded-xl transition-all hover:shadow-md"
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Decorative Line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
    </div>
  );
}