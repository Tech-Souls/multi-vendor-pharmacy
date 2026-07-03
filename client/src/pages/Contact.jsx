import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck, Send, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Eyebrow = ({ children }) => (
  <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 mb-4 tracking-wider uppercase">
    {children}
  </span>
);

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionalReg: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await API.post('/contacts', formData);

      if (response.data) {
        toast.success("Query submitted successfully. Our pharmacy team will respond within 24 hours.");
        setFormData({
          name: '',
          email: '',
          professionalReg: '',
          subject: 'General Inquiry',
          message: ''
        });
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit query');
      }
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* HERO SECTION with Background Image */}
      <section className="relative h-[478px] sm:h-[528px] md:h-[578px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="./contact.jpg"
            alt="Contact our pharmacy team"
            className="w-full h-full object-fill"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 md:ml-[100px]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <MessageCircle className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-teal-300 tracking-wider uppercase">Clinical Help Desk</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Contact Our <br className="hidden sm:block" />
              <span className="text-teal-400">Pharmacy Team</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              Contact our registered pharmacists directly for clinical concerns, account verification queries, or delivery updates.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/register')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center gap-2"
              >
                Create Account <Sparkles className="w-4 h-4" />
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

      {/* CORE CONTACT LAYOUT */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left: Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Eyebrow>Pharmacy Premises</Eyebrow>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Verification & <span className="text-teal-600">Operations</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Operating in full compliance with registered UK pharmacy standards. Direct verification is accessible via the GPhC register.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: MapPin,
                  title: "Registered Dispensary",
                  details: (
                    <>
                      Time Pharmacy<br />
                      [Insert Registered Business Address Details]<br />
                      United Kingdom
                    </>
                  ),
                  badge: "GPhC Premises No: 9010453"
                },
                {
                  icon: Clock,
                  title: "Operational Hours",
                  details: (
                    <>
                      Monday – Friday: 09:00 to 18:00<br />
                      Saturday – Sunday: Closed
                    </>
                  ),
                  badge: "POM Cut-off: 15:00 for same-day dispatch"
                },
                {
                  icon: Phone,
                  title: "Direct Phone Lines",
                  details: "+44 (0) 20 0000 0000",
                  badge: "Clinical queries / Prescriber validation desk"
                },
                {
                  icon: Mail,
                  title: "Email Channels",
                  details: "support@drgpharma.com",
                  badge: "Submit scanned manual Rx forms here"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-all hover:border-teal-200">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{item.details}</p>
                    {item.badge && (
                      <p className="text-[10px] font-semibold mt-1 text-teal-600">{item.badge}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-slate-900">GPhC Registered</span>
              </div>
              <p className="text-xs text-slate-500">
                All communications are handled in compliance with clinical privacy standards and SSL data encryption.
              </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Submit an <span className="text-teal-600">Inquiry</span>
                  </h3>
                  <p className="text-xs text-slate-400">Our pharmacy team will respond within 24 hours</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Dr / Nurse / Practitioner"
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="email@example.com"
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Registration No. (Optional)</label>
                    <input
                      type="text"
                      name="professionalReg"
                      value={formData.professionalReg}
                      onChange={handleInputChange}
                      placeholder="e.g. GPhC / GMC / NMC"
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Topic</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    >
                      <option>General Inquiry</option>
                      <option>Account Validation & Verification</option>
                      <option>SwiftRx™ Prescription Help</option>
                      <option>Fulfillment & Cold-Chain Delivery</option>
                      <option>Regulatory/Audit Request</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Message Details</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Detail your inquiry clearly so our pharmacy team can assist."
                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:shadow-teal-600/40 active:scale-95 flex items-center justify-center gap-2"
                >
                  {sending ? 'Submitting...' : 'Submit Inquiry'}
                  {!sending && <Send className="w-4 h-4" />}
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Form data processed in accordance with clinical privacy standards
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Decorative Line */}
      <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600" />
    </div>
  );
}