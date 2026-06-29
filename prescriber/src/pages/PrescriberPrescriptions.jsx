import { useState, useEffect } from 'react';
import { FileText, Search, Eye, Trash2 } from 'lucide-react'; // ✅ FIX: Added Trash2 import
import { useNavigate } from 'react-router-dom';
import PrescriberHeader from '../components/prescriber/PrescriberHeader';
import API from '../api/axios';
import toast, { Toaster } from "react-hot-toast";


const statusConfig = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-500 border-red-200',
  dispensed: 'bg-green-50 text-green-600 border-green-200',
};

const PrescriberPrescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await API.get('/prescriptions/pending');
        setPrescriptions(response.data?.prescriptions || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  // ✅ FIX: statuses match actual schema enum values
  const statuses = ['all', 'pending', 'approved', 'rejected', 'dispensed'];

  const filtered = prescriptions.filter(p => {
    const matchesSearch = search === '' || (
      p.patientDetails?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientDetails?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      p.patientName?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      p._id?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (prescriptionId) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
            <div>
              <p className="text-sm font-bold text-gray-800">Delete Prescription?</p>
              <p className="text-xs text-gray-400 mt-0.5">Cannot undo</p>
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
      await API.delete(`/prescriptions/${prescriptionId}`);
      setPrescriptions(prev => prev.filter(p => p._id !== prescriptionId));
      toast.success("Prescription deleted.");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error(error.response?.data?.message || "Unable to delete prescription.");
    }
  };
  const handleStatusUpdate = async (prescriptionId, status) => {
    try {
      const response = await API.patch(`/prescriptions/verify/${prescriptionId}`, { status });
      setPrescriptions(prev => prev.map(p => p._id === prescriptionId ? response.data.prescription : p));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Unable to update prescription status');
    }
  };

  // ✅ Helper: get patient name from either form or link prescription
  const getPatientName = (p) => {
    if (p.patientDetails?.firstName) {
      return `${p.patientDetails.firstName} ${p.patientDetails.lastName || ''}`.trim();
    }
    if (p.patientName?.firstName) {
      return `${p.patientName.firstName} ${p.patientName.lastName || ''}`.trim();
    }
    return 'Unknown Patient';
  };

  const getInitial = (p) => {
    return (p.patientDetails?.firstName || p.patientName?.firstName || 'P').charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Prescriptions" />
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              placeholder="Search by patient or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-all ${filter === s ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                  }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center">
              <FileText size={20} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-400 font-medium">No prescriptions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {['Patient', 'Date', 'Treatment', 'Status', '', ''].map((h, i) => (
                    <th key={i} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-slate-600">{getInitial(p)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{getPatientName(p)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">#{p._id?.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {p.treatment || p.method || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusConfig[p.status] || 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        {p.status || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {p.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(p._id, 'approved')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-all"
                          >
                            approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(p._id, 'rejected')}
                            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-[10px] font-black hover:bg-slate-100 transition-all"
                          >
                            reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/prescription-detail/${p._id}`)}
                          className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriberPrescriptions;