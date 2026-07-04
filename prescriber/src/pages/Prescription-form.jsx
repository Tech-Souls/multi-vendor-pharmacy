import { useState } from 'react';
import API from '../api/axios';
import {
  User, Stethoscope, FileText, Search, Plus, Trash2,
  CheckCircle, Loader2, Pill, Truck, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// ✅ Outside component — no re-render on keystroke
const inputCls = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-300 outline-none focus:border-black transition-all font-medium';
const selectCls = `${inputCls} cursor-pointer`;
const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block';

const Field = ({ label, children }) => (
  <div className="flex flex-col">
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

const Card = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
        <Icon size={15} className="text-gray-500" />
      </div>
      <h2 className="text-sm font-semibold text-black">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicinesFetched, setMedicinesFetched] = useState(false);

  const initialState = {
    patient: {
      firstName: '', lastName: '', gender: 'Male',
      dob: '', email: '', phone: '', address: '',
      allergies: '',           // ✅ FIX: was "contraindications" — schema uses "allergies"
    },
    prescriber: {
      name: '', regNumber: '', type: 'Doctor',
      clinicName: '', clinicalNotes: '',
    },
    medications: [],
    delivery: {
      fulfillmentMethod: 'Ship direct to the address',
      deliveryAddress: '',
      validity: '27 days',
    },
  };

  const [formData, setFormData] = useState(initialState);

  const handlePatientChange = (f, v) => setFormData(p => ({ ...p, patient: { ...p.patient, [f]: v } }));
  const handlePrescriberChange = (f, v) => setFormData(p => ({ ...p, prescriber: { ...p.prescriber, [f]: v } }));
  const handleDeliveryChange = (f, v) => setFormData(p => ({ ...p, delivery: { ...p.delivery, [f]: v } }));

  // State add karo
  const [prescribers, setPrescribers] = useState([]);
  const [showPrescribers, setShowPrescribers] = useState(false);

  // Fetch karo
  useEffect(() => {
    const fetchPrescribers = async () => {
      try {
        const { data } = await API.get('/users/prescribers');
        setPrescribers(data.prescribers || []);
      } catch (err) {
        console.error('Failed to fetch prescribers:', err);
      }
    };
    fetchPrescribers();
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    if (!medicinesFetched) {
      setSearching(true);
      try {
        const { data } = await API.get('/medicines');
        const list = Array.isArray(data) ? data : data.medicines || [];
        setAllMedicines(list);
        setMedicinesFetched(true);
        setSearchResults(list.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
      } catch {
        toast.error('Failed to load medicines');
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(allMedicines.filter(m => m.name.toLowerCase().includes(query.toLowerCase())));
    }
  };

  const addMedication = (med) => {
    if (formData.medications.find(m => m._id === med._id)) return toast.error('Already added');
    setFormData(p => ({ ...p, medications: [...p.medications, med] }));
    setSearchQuery(''); setSearchResults([]);
  };

  const removeMedication = (id) =>
    setFormData(p => ({ ...p, medications: p.medications.filter(m => m._id !== id) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medications.length) return toast.error('Add at least one medication');
    setSubmitting(true);
    try {
      await API.post('/prescriptions/submit', {
        // ✅ FIX: send as "patient" which backend maps to patientDetails
        patient: formData.patient,
        prescriber: formData.prescriber,
        medications: formData.medications.map(m => m._id),
        method: 'form',
      });
      toast.success('Prescription submitted!');
      setFormData(initialState);
      setSearchQuery(''); setSearchResults([]);
      navigate('/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 md:px-10 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-black transition-colors text-sm">
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-gray-200">·</span>
          <div>
            <h1 className="text-sm font-semibold text-black">New Prescription</h1>
            <p className="text-xs text-gray-400">Fill in patient, prescriber and medication details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-5 md:px-10 py-8 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Patient Details */}
          <Card icon={User} title="Patient Details">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name">
                  <input className={inputCls} placeholder="John" required
                    value={formData.patient.firstName}
                    onChange={e => handlePatientChange('firstName', e.target.value)} />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} placeholder="Smith" required
                    value={formData.patient.lastName}
                    onChange={e => handlePatientChange('lastName', e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender">
                  <select className={selectCls}
                    value={formData.patient.gender}
                    onChange={e => handlePatientChange('gender', e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Date of Birth">
                  <input type="date" className={inputCls} required
                    value={formData.patient.dob}
                    onChange={e => handlePatientChange('dob', e.target.value)} />
                </Field>
              </div>

              <Field label="Email">
                <input type="email" className={inputCls} placeholder="patient@email.com" required
                  value={formData.patient.email}
                  onChange={e => handlePatientChange('email', e.target.value)} />
              </Field>

              <Field label="Phone">
                <input type="tel" className={inputCls} placeholder="+44 7700 000000" required
                  value={formData.patient.phone}
                  onChange={e => handlePatientChange('phone', e.target.value)} />
              </Field>

              <Field label="Address">
                <input className={inputCls} placeholder="123 Main St, London" required
                  value={formData.patient.address}
                  onChange={e => handlePatientChange('address', e.target.value)} />
              </Field>

              {/* ✅ FIX: was using "contraindications" — now correctly uses "allergies" */}
              <Field label="Allergies / Contraindications">
                <textarea rows={2} className={`${inputCls} resize-none`}
                  placeholder="e.g. Penicillin, NSAIDs..."
                  value={formData.patient.allergies}
                  onChange={e => handlePatientChange('allergies', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-5">

            <Card icon={Stethoscope} title="Prescriber Details">
              <div className="space-y-3">

                {/* available prescribers */}
                <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowPrescribers(!showPrescribers)}
                  className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {showPrescribers ? 'Hide' : 'View Available Prescribers'}
                </button>

                {showPrescribers && (
                  <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reg No</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speciality</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {prescribers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-gray-300 text-xs">
                              No prescribers available
                            </td>
                          </tr>
                        ) : (
                          prescribers.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 font-semibold text-black">{p.name}</td>
                              <td className="px-3 py-2 text-gray-500 font-mono">{p.registrationNumber}</td>
                              <td className="px-3 py-2 text-gray-500">{p.professionalRole}</td>
                              <td className="px-3 py-2 text-gray-500">{p.primarySpeciality}</td>
                              <td className="px-3 py-2">
                                {/* ✅ Click karo toh auto-fill ho */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handlePrescriberChange('name', p.name);
                                    handlePrescriberChange('regNumber', p.registrationNumber);
                                    handlePrescriberChange('type', p.professionalRole || 'Doctor');
                                    handlePrescriberChange('clinicName', p.practiceName || '');
                                    setShowPrescribers(false);
                                  }}
                                  className="text-[10px] font-bold text-blue-500 hover:text-blue-700 px-2 py-1 bg-blue-50 rounded-lg transition-colors"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

                <Field label="Full Name">
                  <input className={inputCls} placeholder="Dr. Sarah Connor" required
                    value={formData.prescriber.name}
                    onChange={e => handlePrescriberChange('name', e.target.value)} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Reg. Number">
                    <input className={inputCls} placeholder="GMC-12345" required
                      value={formData.prescriber.regNumber}
                      onChange={e => handlePrescriberChange('regNumber', e.target.value)} />
                  </Field>
                  <Field label="Type">
                    <select className={selectCls}
                      value={formData.prescriber.type}
                      onChange={e => handlePrescriberChange('type', e.target.value)}>
                      <option>Doctor</option>
                      <option>Medical Dentist</option>
                      <option>Nurse Prescriber</option>
                    </select>
                  </Field>
                </div>

                <Field label="Clinic / Practice">
                  <input className={inputCls} placeholder="City Health Clinic" required
                    value={formData.prescriber.clinicName}
                    onChange={e => handlePrescriberChange('clinicName', e.target.value)} />
                </Field>

                <Field label="Clinical Notes (optional)">
                  <textarea rows={2} className={`${inputCls} resize-none`}
                    placeholder="Any additional notes..."
                    value={formData.prescriber.clinicalNotes}
                    onChange={e => handlePrescriberChange('clinicalNotes', e.target.value)} />
                </Field>
              </div>
            </Card>

            <Card icon={Pill} title="Medications">
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  {searching && <Loader2 size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                  <input
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search medicines..."
                    className={`${inputCls} pl-9`}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                      {searchResults.map(med => (
                        <div key={med._id} onClick={() => addMedication(med)}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0 transition-colors">
                          <div>
                            <p className="text-xs font-semibold text-black">{med.name}</p>
                            {med.category && <p className="text-[10px] text-gray-400">{med.category}</p>}
                          </div>
                          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Plus size={12} className="text-gray-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formData.medications.length === 0 ? (
                  <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                    <Pill size={18} className="mx-auto text-gray-200 mb-1.5" />
                    <p className="text-xs text-gray-300 font-medium">No medications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.medications.map((med, i) => (
                      <div key={med._id}
                        className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-lg bg-gray-200 text-gray-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                          <span className="text-xs font-semibold text-black">{med.name}</span>
                        </div>
                        <button type="button" onClick={() => removeMedication(med._id)}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <p className="text-[10px] text-gray-400 text-right font-medium">
                      {formData.medications.length} medication{formData.medications.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Delivery */}
        <Card icon={Truck} title="Dispensing & Delivery">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Fulfillment Method">
              <select className={selectCls}
                value={formData.delivery.fulfillmentMethod}
                onChange={e => handleDeliveryChange('fulfillmentMethod', e.target.value)}>
                <option>Ship direct to the address</option>
                <option>Ship to the clinic</option>
                <option>Patient to collect from pharmacy</option>
              </select>
            </Field>
            <Field label="Delivery Address">
              <input className={inputCls} placeholder="Enter delivery address"
                value={formData.delivery.deliveryAddress}
                onChange={e => handleDeliveryChange('deliveryAddress', e.target.value)} />
            </Field>
            <Field label="Prescription Validity">
              <select className={selectCls}
                value={formData.delivery.validity}
                onChange={e => handleDeliveryChange('validity', e.target.value)}>
                <option>27 days</option>
                <option>14 days</option>
                <option>7 days</option>
                <option>Same day</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* ✅ FIX: Known Allergies bottom field also uses "allergies" not "contraindications" */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            <div className="flex-1 w-full">
              <label className={labelCls}>Known Allergies</label>
              <textarea rows={2} className={`${inputCls} resize-none`}
                placeholder="List any known allergies, e.g. Penicillin, Latex..."
                value={formData.patient.allergies}
                onChange={e => handlePatientChange('allergies', e.target.value)} />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full md:w-auto shrink-0 px-8 py-3 bg-black text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50">
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                : <><CheckCircle size={15} /> Submit Prescription</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;