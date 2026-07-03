import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PrescriberHeader from './PrescriberHeader';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  approved: 'bg-blue-50 text-blue-600 border-blue-200',
  rejected: 'bg-red-50 text-red-500 border-red-200',
  dispensed: 'bg-green-50 text-green-600 border-green-200',
};

const PrescriptionDetail = () => {
  const [searchParams] = useSearchParams(); // 👈 ADD this
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get prescription ID from URL params - either from the route param or search param
  const routeId = useParams().id;
  const searchId = searchParams.get('prescriptionId');
  const id = routeId || searchId;

  useEffect(() => {
    if (!id) {
      navigate('/dashboard?page=prescriptions');
      return;
    }

    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/prescriptions/${id}`);
        setPrescription(response.data);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        toast.error('Failed to load prescription details');
        navigate('/dashboard?page=prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id, navigate]);

  const handleStatusUpdate = async (status) => {
    try {
      await API.patch(`/prescriptions/verify/${id}`, { status });
      setPrescription(prev => ({ ...prev, status }));
      toast.success(`Prescription ${status}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Unable to update prescription status');
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard?page=prescriptions');
  };

  const getPatientName = (p) => {
    if (p?.patientDetails?.firstName) {
      return `${p.patientDetails.firstName} ${p.patientDetails.lastName || ''}`.trim();
    }
    if (p?.patientName?.firstName) {
      return `${p.patientName.firstName} ${p.patientName.lastName || ''}`.trim();
    }
    return 'Unknown Patient';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 antialiased">
        <PrescriberHeader title="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-slate-50 antialiased">
        <PrescriberHeader title="Not Found" />
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <p className="text-slate-600">Prescription not found</p>
            <button 
              onClick={handleGoBack}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              Back to prescriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      <PrescriberHeader title="Prescription Details" />
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to prescriptions
        </button>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Prescription</p>
                <h1 className="text-2xl font-bold text-slate-800 mt-1">
                  #{prescription._id?.slice(-6).toUpperCase()}
                </h1>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold capitalize border ${
                statusConfig[prescription.status] || 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {prescription.status}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Patient</p>
                <p className="text-sm font-semibold text-slate-700">{getPatientName(prescription)}</p>
                {prescription.patientDetails?.email && (
                  <p className="text-xs text-slate-500">{prescription.patientDetails.email}</p>
                )}
                {prescription.patientDetails?.phone && (
                  <p className="text-xs text-slate-500">{prescription.patientDetails.phone}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Date</p>
                <p className="text-sm font-medium text-slate-600">
                  {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  }) : '—'}
                </p>
                <p className="text-xs text-slate-500">
                  {prescription.createdAt ? new Date(prescription.createdAt).toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit'
                  }) : ''}
                </p>
              </div>
            </div>

            {/* Prescriber Info */}
            {prescription.prescriberDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Prescriber</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {prescription.prescriberDetails.firstName} {prescription.prescriberDetails.lastName || ''}
                  </p>
                  {prescription.prescriberDetails.email && (
                    <p className="text-xs text-slate-500">{prescription.prescriberDetails.email}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Method</p>
                  <p className="text-sm font-medium text-slate-600 capitalize">{prescription.method || 'form'}</p>
                </div>
              </div>
            )}

            {/* Treatment/Method */}
            {(prescription.treatment || prescription.method) && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Treatment / Method</p>
                <p className="text-sm text-slate-600">{prescription.treatment || prescription.method}</p>
              </div>
            )}

            {/* Medications */}
            {prescription.medications && prescription.medications.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Medications</p>
                <ul className="space-y-1">
                  {prescription.medications.map((med, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      {typeof med === 'object' ? med.name || med._id : med}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Info */}
            {prescription.additionalInfo && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Additional Information</p>
                <p className="text-sm text-slate-600">{prescription.additionalInfo}</p>
              </div>
            )}

            {/* Prescriber Notes */}
            {prescription.prescriberNotes && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Prescriber Notes</p>
                <p className="text-sm text-slate-600">{prescription.prescriberNotes}</p>
              </div>
            )}

            {/* Pharmacist Note */}
            {prescription.pharmacistNote && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Pharmacist Note</p>
                <p className="text-sm text-slate-600">{prescription.pharmacistNote}</p>
              </div>
            )}

            {/* Image */}
            {prescription.image && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Prescription Image</p>
                <img 
                  src={`/uploads/${prescription.image}`} 
                  alt="Prescription"
                  className="max-w-full rounded-lg border border-slate-100 max-h-96 object-contain"
                />
              </div>
            )}

            {/* Status update buttons for pending prescriptions */}
            {prescription.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Approve Prescription
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="px-6 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Reject Prescription
                </button>
              </div>
            )}

            {/* Dispensed status */}
            {prescription.status === 'dispensed' && (
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-medium">✅ This prescription has been dispensed</p>
                  {prescription.verifiedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Dispensed on: {new Date(prescription.verifiedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;