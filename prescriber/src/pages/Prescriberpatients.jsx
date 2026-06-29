import { useState, useEffect } from 'react';
import { User, Search, Phone, Mail, MapPin, Trash2, Calendar, CreditCard, Info } from 'lucide-react';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';
import toast, { Toaster } from "react-hot-toast";


const PrescriberPatient = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res  = await API.get('/prescriber-link/patients');

      // ── DEBUG ──
      console.log('=== PATIENTS API RESPONSE ===', res.data);
      // ── END DEBUG ──

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.patients || [];
      setPatients(data);
    } catch (error) {
      console.error('Patients fetch failed:',
        error.response?.status,
        error.response?.data
      );
    } finally {
      setLoading(false);
    }
  };
  fetchPatients();
}, []);

  const filtered = patients.filter((p) => {
    const query = search.toLowerCase();
    return (
      `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(query)
      || (p.personalEmail || '').toLowerCase().includes(query)
      || (p.mobileNumber || '').toLowerCase().includes(query)
    );
  });

  const handleDelete = async (patientId) => {
  const confirmed = await new Promise((resolve) => {
    toast(
      (t) => (
        <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
          <div>
            <p className="text-sm font-bold text-gray-800">Delete Patient?</p>
            <p className="text-xs text-gray-400 mt-0.5">All associated records will be removed</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-4 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: { background: "transparent", boxShadow: "none", padding: 0 },
      }
    );
  });

  if (!confirmed) return;
  try {
    await API.delete(`/prescriber-link/patients/${patientId}`);
    setPatients((prev) => prev.filter((p) => p._id !== patientId));
    if (selected?._id === patientId) setSelected(null);
    toast.success("Patient deleted.");
  } catch (error) {
    console.error("Failed to delete patient:", error);
    toast.error("Unable to delete patient.");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Patients" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Search Header */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors shadow-sm"
            />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filtered.length} Patients</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Patient List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <User size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No patients found</p>
              </div>
            ) : filtered.map(p => (
              <button key={p._id} onClick={() => setSelected(p)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${selected?._id === p._id ? 'border-slate-400 shadow-sm' : 'border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">{p.firstName?.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-slate-400">{p.personalEmail || 'No email'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Patient Detail Panel */}
          <div className="h-fit sticky top-5">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center border-dashed">
                <Info size={24} className="text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">Select a patient to view full profile</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl">{selected.firstName?.charAt(0)}</div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selected.firstName} {selected.lastName}</h2>
                      <p className="text-xs text-slate-400 font-mono">ID: {selected._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(selected._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <DetailItem icon={Calendar} label="Date of Birth" value={selected.dob ? new Date(selected.dob).toLocaleDateString('en-GB') : 'N/A'} />
                  <DetailItem icon={CreditCard} label="NHS Number" value={selected.nhsNumber || 'Not provided'} />
                  <DetailItem icon={Mail} label="Email Address" value={selected.personalEmail} />
                  <DetailItem icon={Phone} label="Mobile Number" value={selected.mobileNumber} />
                  <DetailItem icon={MapPin} label="Address" value={[selected.addressLine1, selected.city, selected.postcode].filter(Boolean).join(', ') || 'No address provided'} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default PrescriberPatient;