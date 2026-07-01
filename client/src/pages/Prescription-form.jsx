import { useState } from "react";
import API from "../api/axios";
import {
  User, Stethoscope, FileText, Search, Plus, Trash2,
  CheckCircle, Loader2, AlertCircle, Pill, Truck
} from "lucide-react";
import { toast } from "react-hot-toast";

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-0.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
      )}
      <input
        {...props}
        autoComplete="off"
        className={`w-full ${Icon ? "pl-9" : "pl-3.5"} pr-3.5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-cyan-500 focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500/10 transition-all text-sm text-white placeholder:text-slate-500 font-medium`}
      />
    </div>
  </div>
);

const SectionCard = ({ icon: Icon, title, color, children }) => {
  const colors = {
    cyan:    { light: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-slate-700" },
    emerald: { light: "bg-emerald-500/10", text: "text-emerald-400", border: "border-slate-700" },
    violet:  { light: "bg-violet-500/10",  text: "text-violet-400",  border: "border-slate-700" },
    amber:   { light: "bg-amber-500/10",   text: "text-amber-400",   border: "border-slate-700" },
    orange:  { light: "bg-orange-500/10",  text: "text-orange-400",  border: "border-slate-700" },
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className={`px-5 py-4 border-b ${c.border} flex items-center gap-3 bg-slate-900/50`}>
        <div className={`w-8 h-8 rounded-xl ${c.light} ${c.text} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-black text-white tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const PrescriptionForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]       = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicinesFetched, setMedicinesFetched] = useState(false);

  const initialState = {
    patient: {
      firstName: "", lastName: "", gender: "Male",
      dob: "", email: "", phone: "", address: "",
      allergies: "", contraindications: "",
    },
    prescriber: {
      name: "", regNumber: "", type: "Doctor",
      clinicName: "", clinicalNotes: "",
    },
    medications: [], // stores full medicine objects for display
    delivery: {
      fulfillmentMethod: "Ship direct to the address",
      deliveryAddress:   "",
      validity:          "27 days",
    },
  };

  const [formData, setFormData] = useState(initialState);

  const handlePatientChange    = (f, v) => setFormData(p => ({ ...p, patient:    { ...p.patient,    [f]: v } }));
  const handlePrescriberChange = (f, v) => setFormData(p => ({ ...p, prescriber: { ...p.prescriber, [f]: v } }));
  const handleDeliveryChange   = (f, v) => setFormData(p => ({ ...p, delivery:   { ...p.delivery,   [f]: v } }));

  // ── Fetch all medicines once, then filter client-side ─────────
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }

    // Fetch all medicines once
    if (!medicinesFetched) {
      setSearching(true);
      try {
        const { data } = await API.get("/medicines");
        const list = Array.isArray(data) ? data : data.medicines || [];
        setAllMedicines(list);
        setMedicinesFetched(true);
        setSearchResults(list.filter(m =>
          m.name.toLowerCase().includes(query.toLowerCase())
        ));
      } catch {
        toast.error("Failed to load medicines");
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(allMedicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase())
      ));
    }
  };

  const addMedication = (med) => {
    if (formData.medications.find(m => m._id === med._id)) {
      return toast.error("Already added");
    }
    setFormData(p => ({ ...p, medications: [...p.medications, med] }));
    toast.success(`${med.name} added`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeMedication = (id) =>
    setFormData(p => ({ ...p, medications: p.medications.filter(m => m._id !== id) }));

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medications.length) {
      return toast.error("Add at least one medication");
    }

    setSubmitting(true);
    try {
      // ── FIX: send medications as array of ObjectIds ───────────
      await API.post("/prescriptions/submit", {
        patient:     formData.patient,
        prescriber:  formData.prescriber,
        medications: formData.medications.map(m => m._id), // ← ObjectIds only
        method:      "form",
      });

      toast.success("Prescription submitted successfully!");
      setFormData(initialState);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white font-medium outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all appearance-none";

  return (
    <div className="bg-white min-h-screen font-sans pb-16 text-slate-200">

      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-5 mb-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">New Prescription</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Fill in patient, prescriber, and medication details</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle size={13} className="text-amber-500" />
            <span className="text-[11px] font-bold text-amber-500">Pending Approval</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Patient Details */}
          <SectionCard icon={User} title="Patient Details" color="cyan">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="First Name" value={formData.patient.firstName} onChange={e => handlePatientChange("firstName", e.target.value)} placeholder="John"  required />
              <InputField label="Last Name"  value={formData.patient.lastName}  onChange={e => handlePatientChange("lastName",  e.target.value)} placeholder="Smith" required />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Gender</label>
                <select value={formData.patient.gender} onChange={e => handlePatientChange("gender", e.target.value)} className={selectClass}>
                  <option className="bg-slate-900">Male</option>
                  <option className="bg-slate-900">Female</option>
                  <option className="bg-slate-900">Other</option>
                </select>
              </div>

              <InputField label="Date of Birth" type="date" value={formData.patient.dob} onChange={e => handlePatientChange("dob", e.target.value)} required />

              <div className="col-span-2">
                <InputField label="Email" type="email" value={formData.patient.email} onChange={e => handlePatientChange("email", e.target.value)} placeholder="patient@email.com" required />
              </div>
              <div className="col-span-2">
                <InputField label="Phone" type="tel" value={formData.patient.phone} onChange={e => handlePatientChange("phone", e.target.value)} placeholder="+44 7700 000000" required />
              </div>
              <div className="col-span-2">
                <InputField label="Address" value={formData.patient.address} onChange={e => handlePatientChange("address", e.target.value)} placeholder="123 Main Street, London" required />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-0.5">Allergies / Contraindications</label>
                <textarea
                  value={formData.patient.contraindications}
                  onChange={e => handlePatientChange("contraindications", e.target.value)}
                  placeholder="e.g. Penicillin, NSAIDs, Latex..."
                  rows={2}
                  className="w-full px-3.5 py-3 bg-red-500/5 border border-red-500/20 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-sm text-white font-medium placeholder:text-slate-600 transition-all resize-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* Right column */}
          <div className="space-y-5">

            {/* Prescriber Details */}
            <SectionCard icon={Stethoscope} title="Prescriber Details" color="emerald">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <InputField label="Full Name" value={formData.prescriber.name} onChange={e => handlePrescriberChange("name", e.target.value)} placeholder="Dr. Sarah Connor" required />
                </div>
                <InputField label="Reg. Number" value={formData.prescriber.regNumber} onChange={e => handlePrescriberChange("regNumber", e.target.value)} placeholder="GMC-12345" required />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Type</label>
                  <select value={formData.prescriber.type} onChange={e => handlePrescriberChange("type", e.target.value)} className={selectClass}>
                    <option className="bg-slate-900">Doctor</option>
                    <option className="bg-slate-900">Medical Dentist</option>
                    <option className="bg-slate-900">Nurse Prescriber</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <InputField label="Clinic / Practice Name" value={formData.prescriber.clinicName} onChange={e => handlePrescriberChange("clinicName", e.target.value)} placeholder="City Health Clinic" required />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-0.5">Clinical Notes <span className="normal-case font-medium text-slate-600">(optional)</span></label>
                  <textarea
                    value={formData.prescriber.clinicalNotes}
                    onChange={e => handlePrescriberChange("clinicalNotes", e.target.value)}
                    placeholder="Any additional clinical notes..."
                    rows={2}
                    className="w-full px-3.5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-sm text-white font-medium placeholder:text-slate-600 transition-all resize-none"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Medications */}
            <SectionCard icon={Pill} title="Medications" color="violet">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                {searching && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-400 animate-spin" />}
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search by medicine name..."
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium text-white placeholder:text-slate-600 transition-all"
                  onChange={e => handleSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-44 overflow-y-auto">
                    {searchResults.map(med => (
                      <div key={med._id} onClick={() => addMedication(med)}
                        className="px-4 py-2.5 hover:bg-violet-500/10 cursor-pointer flex justify-between items-center border-b border-slate-700 last:border-0 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-white">{med.name}</p>
                          {med.category && <p className="text-[10px] text-slate-500">{med.category}</p>}
                        </div>
                        <div className="w-6 h-6 bg-violet-500/20 rounded-lg flex items-center justify-center">
                          <Plus size={12} className="text-violet-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.medications.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <Pill size={20} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-xs text-slate-600 font-bold">No medications added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                  {formData.medications.map((med, i) => (
                    <div key={med._id} className="flex items-center justify-between px-3 py-2.5 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-lg bg-violet-500/20 text-violet-400 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                        <span className="text-xs font-bold text-slate-200">{med.name}</span>
                      </div>
                      <button type="button" onClick={() => removeMedication(med._id)}
                        className="w-6 h-6 rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.medications.length > 0 && (
                <p className="text-[10px] text-slate-500 font-bold mt-2 text-right">
                  {formData.medications.length} medication{formData.medications.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </SectionCard>
          </div>
        </div>

        {/* Dispensing & Delivery */}
        <SectionCard icon={Truck} title="Dispensing & Delivery" color="orange">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-0.5">Fulfillment Method</label>
              <select value={formData.delivery.fulfillmentMethod} onChange={e => handleDeliveryChange("fulfillmentMethod", e.target.value)} className={selectClass}>
                <option className="bg-slate-900">Ship direct to the address</option>
                <option className="bg-slate-900">Ship to the clinic</option>
                <option className="bg-slate-900">Patient to collect from the pharmacy</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <InputField label="Delivery Address" value={formData.delivery.deliveryAddress} onChange={e => handleDeliveryChange("deliveryAddress", e.target.value)} placeholder="Enter delivery address" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-0.5">Prescription Validity</label>
              <select value={formData.delivery.validity} onChange={e => handleDeliveryChange("validity", e.target.value)} className={selectClass}>
                <option className="bg-slate-900">27 days</option>
                <option className="bg-slate-900">14 days</option>
                <option className="bg-slate-900">7 days</option>
                <option className="bg-slate-900">Immediate same on day</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Allergies + Submit */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle size={13} className="text-amber-500" />
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Known Allergies</label>
              </div>
              <textarea
                value={formData.patient.allergies}
                placeholder="List any known allergies, e.g. Penicillin, Latex, Aspirin..."
                rows={2}
                onChange={e => handlePatientChange("allergies", e.target.value)}
                className="w-full p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 text-sm text-white font-medium placeholder:text-slate-700 transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto shrink-0 px-8 py-3.5 bg-slate-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-slate-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                : <><CheckCircle size={15} /> Submit Prescription</>
              }
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default PrescriptionForm;