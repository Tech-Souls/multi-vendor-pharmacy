import { useState, useEffect } from "react";
import API from "../api/axios";
import Header from "./Header";
import {
  UserPlus, CheckCircle, Loader2, Clock, AlertTriangle,
  ClipboardList, ShieldCheck, Trash2, Pill, Eye,
  ChevronDown, ChevronUp, FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ── status badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: "bg-amber-50 text-amber-700 border-amber-200",   icon: <Clock size={10} />,         label: "pending"   },
    approved:  { cls: "bg-blue-50 text-blue-700 border-blue-200",      icon: <CheckCircle size={10} />,   label: "approved"  },
    active:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle size={10} />, label: "verified"  },
    rejected:  { cls: "bg-red-50 text-red-600 border-red-200",         icon: <AlertTriangle size={10} />, label: "rejected"  },
    dispensed: { cls: "bg-green-50 text-green-700 border-green-200",   icon: <CheckCircle size={10} />,   label: "dispensed" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide border ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
};

// ── info cell ─────────────────────────────────────────────────
const InfoCell = ({ label, value }) => !value ? null : (
  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
    <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-0.5 uppercase">{label}</p>
    <p className="text-xs font-semibold text-slate-700 break-words">{value}</p>
  </div>
);

const Prescriptions = () => {
  const [activeTab, setActiveTab]   = useState("prescriptions");
  const [links, setLinks]           = useState([]);
  const [requests, setRequests]     = useState([]);
  const [pending, setPending]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [linksRes, reqsRes, pendingRes] = await Promise.all([
        API.get("/prescriber-link/admin/pending"),
        API.get("/prescriber-link/admin/requests"),
        API.get("/prescriptions/pending"),
      ]);
      setLinks(Array.isArray(linksRes.data)                     ? linksRes.data                     : []);
      setRequests(Array.isArray(reqsRes.data)                   ? reqsRes.data                      : []);
      setPending(pendingRes.data?.prescriptions || []);
    } catch (err) {
      console.error("fetch error:", err);
      if (err.response?.status !== 404) toast.error("could not load data");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await API.patch(`/prescriptions/verify/${id}`, {
        status,
        note: noteInputs[id] || "",
      });
      toast.success(`prescription ${status} ✓`);
      fetchAll();
    } catch {
      toast.error("action failed");
    }
  };

  const handleLinkAction = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/admin/verify-link/${id}`, { status });
      toast.success(status === "active" ? "professional verified ✓" : "request rejected");
      fetchAll();
    } catch { toast.error("action failed"); }
  };

  const handleRequestAction = async (id, status) => {
    try {
      await API.patch(`/prescriber-link/admin/verify-request/${id}`, { status });
      toast.success(status === "deleted" ? "request deleted" : `prescription ${status} ✓`);
      fetchAll();
    } catch { toast.error("action failed"); }
  };

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  const counts = {
    pendingPrescriptions: pending.filter(p => p.status === "pending").length,
    pendingLinks:         links.filter(l => l.status === "pending").length,
    pendingRequests:      requests.filter(r => r.status === "pending").length,
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-400" size={28} />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Header title="Prescription Management" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">

        {/* stats - responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pending Prescriptions", value: counts.pendingPrescriptions, cls: counts.pendingPrescriptions > 0 ? 'text-amber-600' : 'text-slate-800' },
            { label: "Pending Verifications", value: counts.pendingLinks,         cls: counts.pendingLinks > 0 ? 'text-amber-600' : 'text-slate-800'         },
            { label: "Total Requests",        value: requests.length,             cls: 'text-slate-800'                                                       },
            { label: "Pending Requests",      value: counts.pendingRequests,      cls: counts.pendingRequests > 0 ? 'text-amber-600' : 'text-slate-800'       },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl px-3 sm:px-4 py-3 shadow-sm">
              <p className={`text-xl sm:text-2xl font-black ${s.cls}`}>{s.value}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* tabs - scrollable on mobile */}
        <div className="flex gap-2 flex-wrap bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
          {[
            { key: "pending",       label: "Prescriptions",          icon: <FileText size={13} />,    count: counts.pendingPrescriptions },
            { key: "prescriptions", label: "Prescription Requests",  icon: <ClipboardList size={13} />, count: counts.pendingRequests    },
            { key: "links",         label: "Professional Verification", icon: <ShieldCheck size={13} />, count: counts.pendingLinks       },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setExpandedId(null); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.icon}
              <span className="hidden xs:inline">{t.label}</span>
              <span className="xs:hidden">{t.label.split(' ')[0]}</span>
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === t.key ? 'bg-white text-black' : 'bg-amber-100 text-amber-700'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── real prescriptions tab ──────────────────────────── */}
        {activeTab === "pending" && (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                <FileText size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-400">No prescriptions submitted yet</p>
              </div>
            ) : (
              pending.map(rx => (
                <div key={rx._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center flex-wrap gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800">
                          {rx.patientDetails?.firstName} {rx.patientDetails?.lastName}
                        </p>
                        <StatusBadge status={rx.status} />
                        {rx.method && (
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                            {rx.method}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Prescriber: <span className="font-semibold text-slate-700">{rx.prescriberDetails?.name || "—"}</span>
                        {rx.patientDetails?.email && <span className="hidden sm:inline ml-2">· {rx.patientDetails.email}</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                      {rx.medications?.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                          <Pill size={12} className="text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-700">
                            {rx.medications.length} med{rx.medications.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {rx.image && (
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/${rx.image}`, "_blank")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors"
                        >
                          <Eye size={12} /> <span className="hidden xs:inline">View Image</span>
                        </button>
                      )}

                      <div className="flex gap-2">
                        {rx.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerify(rx._id, "approved")}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(rx._id, "rejected")}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {rx.status === "approved" && (
                          <button
                            onClick={() => handleVerify(rx._id, "dispensed")}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                          >
                            <span className="hidden xs:inline">Mark Dispensed</span>
                            <span className="xs:hidden">Dispense</span>
                          </button>
                        )}
                      </div>

                      <button onClick={() => toggle(rx._id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        {expandedId === rx._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {expandedId === rx._id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <InfoCell label="phone"       value={rx.patientDetails?.phone} />
                        <InfoCell label="date of birth" value={rx.patientDetails?.dob ? new Date(rx.patientDetails.dob).toLocaleDateString("en-GB") : null} />
                        <InfoCell label="reg number"  value={rx.prescriberDetails?.regNumber} />
                        <InfoCell label="clinic"      value={rx.prescriberDetails?.clinicName} />
                        <InfoCell label="allergies"   value={rx.patientDetails?.allergies} />
                        <InfoCell label="address"     value={rx.patientDetails?.address} />
                        <InfoCell label="submitted"   value={rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                        <InfoCell label="verified at" value={rx.verifiedAt ? new Date(rx.verifiedAt).toLocaleDateString("en-GB") : "—"} />
                      </div>

                      {rx.medications?.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-2 uppercase">Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {rx.medications.map((m, i) => (
                              <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-[10px] font-semibold text-blue-700">
                                {m.name || m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rx.status === "pending" && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                            Pharmacist Note (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Add a note..."
                            value={noteInputs[rx._id] || ""}
                            onChange={e => setNoteInputs(n => ({ ...n, [rx._id]: e.target.value }))}
                            className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                          />
                        </div>
                      )}

                      {rx.pharmacistNote && (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1 uppercase">Pharmacist Note</p>
                          <p className="text-xs text-slate-600 italic">"{rx.pharmacistNote}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── prescription requests tab ───────────────────────── */}
        {activeTab === "prescriptions" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                <ClipboardList size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-400">No prescription requests found</p>
              </div>
            ) : (
              requests.map(rx => (
                <div key={rx._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center flex-wrap gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800">
                          {rx.patient?.firstName} {rx.patient?.lastName}
                        </p>
                        <StatusBadge status={rx.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Prescriber: <span className="font-semibold text-slate-700">{rx.prescriber?.name || "—"}</span>
                        {rx.treatment && <span className="hidden sm:inline ml-2">· {rx.treatment}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                      {rx.medications?.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                          <Pill size={12} className="text-blue-600" />
                          <span className="text-[10px] font-bold text-blue-700">
                            {rx.medications.length} med{rx.medications.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {rx.consentDocumentation && (
                        <button onClick={() => window.open(rx.consentDocumentation, "_blank")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold hover:bg-slate-200 transition-colors">
                          <Eye size={12} /> <span className="hidden xs:inline">Consent</span>
                        </button>
                      )}
                      <div className="flex gap-2">
                        {rx.status === "pending" && (
                          <>
                            <button onClick={() => handleRequestAction(rx._id, "approved")}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors">
                              Approve
                            </button>
                            <button onClick={() => handleRequestAction(rx._id, "rejected")}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors">
                              Reject
                            </button>
                          </>
                        )}
                        {rx.status !== "pending" && (
                          <button onClick={() => handleRequestAction(rx._id, "deleted")}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <button onClick={() => toggle(rx._id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        {expandedId === rx._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  {expandedId === rx._id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <InfoCell label="Prescriber Email" value={rx.prescriber?.email} />
                        <InfoCell label="Treatment"        value={rx.treatment} />
                        <InfoCell label="Request ID"       value={`#${rx._id?.slice(-6).toUpperCase()}`} />
                        <InfoCell label="Submitted"        value={rx.createdAt ? new Date(rx.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                      </div>
                      {rx.clinicalNotes && (
                        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest mb-1 uppercase">Clinical Notes</p>
                          <p className="text-xs text-slate-600 italic">"{rx.clinicalNotes}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── professional verification tab ───────────────────── */}
        {activeTab === "links" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <UserPlus size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-bold text-slate-700">Professional Verification Queue</h2>
            </div>
            {links.length === 0 ? (
              <div className="py-16 text-center">
                <UserPlus size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-400">No professional requests</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {links.map(link => (
                  <div key={link._id}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {link.requesterId?.name || `${link.requesterId?.firstName || ""} ${link.requesterId?.lastName || ""}`.trim() || "Unknown"}
                          </p>
                          <StatusBadge status={link.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {link.requesterRole}
                          <span className="mx-1">·</span>
                          Reg: <span className="font-semibold text-slate-700">{link.registrationNumber}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {link.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleLinkAction(link._id, "active")}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors">
                              Verify
                            </button>
                            <button onClick={() => handleLinkAction(link._id, "rejected")}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50 transition-colors">
                              Reject
                            </button>
                          </div>
                        )}
                        <button onClick={() => toggle(link._id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                          {expandedId === link._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                    {expandedId === link._id && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <InfoCell label="Email"           value={link.requesterId?.email} />
                          <InfoCell label="Registration No" value={link.registrationNumber} />
                          <InfoCell label="Message"         value={link.message || "No message"} />
                          <InfoCell label="Submitted"       value={link.createdAt ? new Date(link.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Prescriptions;