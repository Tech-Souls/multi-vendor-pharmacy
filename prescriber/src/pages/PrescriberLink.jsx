import { useState, useEffect } from 'react';
import {
  UserPlus, Search, ClipboardList, Send,
  CheckCircle, Loader2, Package, X, AlertCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ✅ Outside component — fixes focus loss on keystroke
const inputCls  = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-300 outline-none focus:border-black transition-all font-medium';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls  = 'text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block';

const Field = ({ label, children }) => (
  <div className="flex flex-col">
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="w-8 h-8 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
        <Icon size={15} className="text-gray-500" />
      </div>
      <h2 className="text-sm font-semibold text-black">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const PrescriberLink = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activePrescribers, setActivePrescribers] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [linkData, setLinkData] = useState({
    prescriberId: '', registrationNumber: '',
    role: 'Aesthetic nurse non-prescriber', message: '',
  });

  const [requestData, setRequestData] = useState({
    prescriberId: '', patientFirstName: '', patientLastName: '',
    dob: '', consultationDate: new Date().toISOString().split('T')[0],
    treatment: 'Dermal Fillers', clinicalNotes: '',
  });

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => { fetchActiveLinks(); }, []);

  const fetchActiveLinks = async () => {
    try {
      const { data } = await axios.get(`${BASE}/api/prescriber-link/active-links`, { headers: headers() });
      setActivePrescribers(Array.isArray(data) ? data : []);
    } catch { setActivePrescribers([]); }
  };

  const handleSearch = async (query) => {
    setSelectedName(query);
    setLinkData(p => ({ ...p, prescriberId: '' }));
    if (!query || query.length < 3) return setSearchResults([]);
    setSearching(true);
    try {
      const { data } = await axios.get(`${BASE}/api/prescriber-link/search`, {
        params: { query }, headers: headers(),
      });
      setSearchResults(Array.isArray(data) ? data : (data.users || []));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const handleProductSearch = async (query) => {
    setProductQuery(query);
    if (query.length < 2) return setAvailableProducts([]);
    try {
      const { data } = await axios.get(`${BASE}/api/medicines?search=${query}`);
      setAvailableProducts(Array.isArray(data) ? data : (data.medicines || []));
    } catch { setAvailableProducts([]); }
  };

  const addProduct = (p) => {
    if (!selectedProducts.find(x => x._id === p._id))
      setSelectedProducts(prev => [...prev, p]);
    setProductQuery(''); setAvailableProducts([]);
  };

  const handleLinkRequest = async () => {
    if (!linkData.prescriberId) return toast.error('Select a prescriber');
    if (!linkData.registrationNumber) return toast.error('Enter registration number');
    setLoading(true);
    try {
      await axios.post(`${BASE}/api/prescriber-link/link`, {
        prescriberId: linkData.prescriberId,
        requesterRole: linkData.role,
        registrationNumber: linkData.registrationNumber,
        message: linkData.message,
      }, { headers: headers() });
      toast.success('Link request sent!');
      setLinkData({ prescriberId: '', registrationNumber: '', role: 'Aesthetic nurse non-prescriber', message: '' });
      setSelectedName('');
      fetchActiveLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setLoading(false); }
  };

  const handlePrescriptionSubmit = async () => {
    if (!requestData.prescriberId) return toast.error('Select a prescriber');
    if (!requestData.patientFirstName || !requestData.patientLastName) return toast.error('Enter patient name');
    setLoading(true);
    try {
      await axios.post(`${BASE}/api/prescriber-link/request-prescription`, {
        prescriberId: requestData.prescriberId,
        patientFirstName: requestData.patientFirstName,
        patientLastName: requestData.patientLastName,
        dob: requestData.dob,
        consultationDate: requestData.consultationDate,
        treatment: requestData.treatment,
        clinicalNotes: requestData.clinicalNotes,
        productsRequired: selectedProducts.map(p => p._id),
      }, { headers: headers() });
      toast.success('Submitted to prescriber!');
      setSelectedProducts([]);
      setRequestData(p => ({ ...p, patientFirstName: '', patientLastName: '', dob: '', clinicalNotes: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 md:px-10 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-black text-sm transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <span className="text-gray-200">·</span>
            <div>
              <h1 className="text-sm font-semibold text-black">Prescriber Collaboration</h1>
              <p className="text-xs text-gray-400">Connect with clinicians to authorise treatments</p>
            </div>
          </div>
          {activePrescribers.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle size={12} className="text-green-500" />
              <span className="text-[10px] font-bold text-green-600">{activePrescribers.length} linked</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── Link a Prescriber ── */}
          <Card icon={UserPlus} title="Link a Prescriber">
            <div className="space-y-4">
              <Field label="Search Prescribers">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  {searching && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                  <input
                    value={selectedName}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Type name (min 3 chars)..."
                    className={`${inputCls} pl-9`}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-lg rounded-xl z-20 mt-1 max-h-44 overflow-y-auto">
                      {searchResults.map(p => (
                        <div key={p._id}
                          onClick={() => {
                            setLinkData(prev => ({ ...prev, prescriberId: p._id }));
                            setSelectedName(p.name);
                            setSearchResults([]);
                            toast.success(`Selected: ${p.name}`);
                          }}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                          <p className="text-xs font-semibold text-black">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.email} · {p.role}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {linkData.prescriberId && (
                  <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1 mt-1.5">
                    <CheckCircle size={10} /> Prescriber selected
                  </p>
                )}
              </Field>

              <Field label="Professional Registration">
                <input className={inputCls} placeholder="e.g. GMC 1234567"
                  value={linkData.registrationNumber}
                  onChange={e => setLinkData(p => ({ ...p, registrationNumber: e.target.value }))} />
              </Field>

              <Field label="Your Role">
                <select className={selectCls}
                  value={linkData.role}
                  onChange={e => setLinkData(p => ({ ...p, role: e.target.value }))}>
                  <option>Aesthetic nurse non-prescriber</option>
                  <option>Aesthetic therapist</option>
                  <option>Doctor (non-prescriber)</option>
                  <option>Dentist (non-prescriber)</option>
                  <option>Paramedic</option>
                  <option>Other healthcare professions</option>
                </select>
              </Field>

              <Field label="Message (optional)">
                <textarea rows={3} className={`${inputCls} resize-none`}
                  placeholder="Introduce yourself..."
                  value={linkData.message}
                  onChange={e => setLinkData(p => ({ ...p, message: e.target.value }))} />
              </Field>

              <button onClick={handleLinkRequest} disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Link Request
              </button>
            </div>
          </Card>

          {/* ── Request a Prescription ── */}
          <Card icon={ClipboardList} title="Request a Prescription">
            <div className="space-y-4">
              <Field label="Send to Prescriber">
                <select className={selectCls}
                  value={requestData.prescriberId}
                  onChange={e => setRequestData(p => ({ ...p, prescriberId: e.target.value }))}>
                  <option value="">— Select linked professional —</option>
                  {activePrescribers.map(link => {
                    const prescriberUser = link.prescriberId; // ye populated User object hai
                    const id = prescriberUser?._id || '';   // MongoDB _id use karo yahan
                    const name = prescriberUser?.name ||
                      `${prescriberUser?.firstName || ''} ${prescriberUser?.lastName || ''}`.trim() ||
                      'Unknown';

                    return (
                      <option
                        key={link._id}
                        value={id}
                        disabled={link.status === 'pending'}
                      >
                        {name} {link.status === 'pending' ? '(Pending approval)' : ''}
                      </option>
                    );
                  })}
                </select>
                {activePrescribers.length === 0 && (
                  <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-1.5">
                    <AlertCircle size={10} /> No linked prescribers — send a request first
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Patient First Name">
                  <input className={inputCls} placeholder="First"
                    value={requestData.patientFirstName}
                    onChange={e => setRequestData(p => ({ ...p, patientFirstName: e.target.value }))} />
                </Field>
                <Field label="Patient Last Name">
                  <input className={inputCls} placeholder="Last"
                    value={requestData.patientLastName}
                    onChange={e => setRequestData(p => ({ ...p, patientLastName: e.target.value }))} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth">
                  <input type="date" className={inputCls}
                    value={requestData.dob}
                    onChange={e => setRequestData(p => ({ ...p, dob: e.target.value }))} />
                </Field>
                <Field label="Consultation Date">
                  <input type="date" className={inputCls}
                    value={requestData.consultationDate}
                    onChange={e => setRequestData(p => ({ ...p, consultationDate: e.target.value }))} />
                </Field>
              </div>

              <Field label="Treatment">
                <select className={selectCls}
                  value={requestData.treatment}
                  onChange={e => setRequestData(p => ({ ...p, treatment: e.target.value }))}>
                  <option>Dermal Fillers</option>
                  <option>Anti-Wrinkle Injection</option>
                  <option>Vitamin B12</option>
                  <option>Skin Booster</option>
                </select>
              </Field>

              <Field label="Products Required">
                <div className="relative">
                  <Package size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input className={`${inputCls} pl-9`} placeholder="Search products..."
                    value={productQuery}
                    onChange={e => handleProductSearch(e.target.value)} />
                  {availableProducts.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-lg rounded-xl z-20 mt-1 max-h-40 overflow-y-auto">
                      {availableProducts.map(prod => (
                        <div key={prod._id} onClick={() => addProduct(prod)}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-700 border-b border-gray-50 last:border-0 transition-colors">
                          {prod.name}
                          {prod.category && <span className="text-gray-400 font-medium ml-1">· {prod.category}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProducts.map(p => (
                      <span key={p._id}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {p.name}
                        <button type="button"
                          onClick={() => setSelectedProducts(prev => prev.filter(x => x._id !== p._id))}
                          className="text-gray-400 hover:text-black">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Clinical Notes">
                <textarea rows={2} className={`${inputCls} resize-none`}
                  placeholder="Patient history, treatment plan..."
                  value={requestData.clinicalNotes}
                  onChange={e => setRequestData(p => ({ ...p, clinicalNotes: e.target.value }))} />
              </Field>

              <button onClick={handlePrescriptionSubmit} disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Submit to Prescriber
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrescriberLink;