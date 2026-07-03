import { useState, useEffect } from 'react';
import Header from './Header';
import toast from 'react-hot-toast';
import { Mail, Trash2, RefreshCw, X } from 'lucide-react';
import API from '../api/axios';

const Setting = () => {
  const [pharmacyForm, setPharmacyForm] = useState({
    name: 'Healthcare Time Ltd t/a Time Pharmacy',
    gphc: '9010453',
    pharmacist: '',
  });

  const [financialForm, setFinancialForm] = useState({
    paymentRate: '1.5',
    vatRate: '20',
    packaging: '2.50',
    delivery: '5.00',
  });

  const [savingPharmacy, setSavingPharmacy] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch contacts on load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await API.get('/contacts');
      if (response.data) {
        setContacts(response.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoadingContacts(false);
    }
  };

  const deleteContact = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`/contacts/${id}`);
      toast.success('Message deleted successfully');
      setContacts(contacts.filter(contact => contact._id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSavePharmacy = async () => {
    setSavingPharmacy(true);
    try {
      localStorage.setItem('pharmacySettings', JSON.stringify(pharmacyForm));
      toast.success('Pharmacy details saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSavingPharmacy(false);
    }
  };

  const handleSaveFinancial = async () => {
    setSavingFinancial(true);
    try {
      localStorage.setItem('financialSettings', JSON.stringify(financialForm));
      toast.success('Financial settings saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSavingFinancial(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-blue-900">
      <Header title="Settings" />
      <div className="p-6 max-w-7xl mx-auto">

        {/* Title Section */}
        <div className="mb-8 border-b border-blue-50 pb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            System Settings
          </h1>
          <p className="text-blue-450 text-md mt-1">
            Configure pharmacy identity and financial parameters <br /> for automated commission calculation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Pharmacy Details */}
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-md font-bold uppercase tracking-widest text-blue-550">Pharmacy Details</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Pharmacy Name', key: 'name', type: 'text' },
                { label: 'GPhC Registration', key: 'gphc', type: 'text' },
                { label: 'Responsible Pharmacist', key: 'pharmacist', type: 'text', placeholder: 'Enter name' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={pharmacyForm[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setPharmacyForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={handleSavePharmacy}
                disabled={savingPharmacy}
                className="mt-2 px-6 py-3 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {savingPharmacy ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </div>

          {/* Three-Pot Financial Settings */}
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-md font-bold uppercase tracking-widest text-blue-550">Financial Rules</h2>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-blue-700 text-[9px] leading-relaxed">
                <span className="font-bold uppercase mr-1">Policy:</span>
                Dr G retains 100% of net margin. Time Pharmacy is reimbursed exact costs only
                (COGS + packaging + delivery).
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Payment Rate (%)</label>
                  <input
                    type="number" step="0.1"
                    value={financialForm.paymentRate}
                    onChange={e => setFinancialForm(f => ({ ...f, paymentRate: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={financialForm.vatRate}
                    onChange={e => setFinancialForm(f => ({ ...f, vatRate: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Packaging (£)</label>
                  <input
                    type="number" step="0.01"
                    value={financialForm.packaging}
                    onChange={e => setFinancialForm(f => ({ ...f, packaging: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-blue-500 uppercase mb-1.5">Delivery (£)</label>
                  <input
                    type="number" step="0.01"
                    value={financialForm.delivery}
                    onChange={e => setFinancialForm(f => ({ ...f, delivery: e.target.value }))}
                    className="w-full bg-white border border-blue-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveFinancial}
                disabled={savingFinancial}
                className="mt-2 px-6 py-3 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {savingFinancial ? 'Saving...' : 'Save Financials'}
              </button>
            </div>
          </div>

          {/* Contact Messages Section */}
          <div className="lg:col-span-2 border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-md font-bold uppercase tracking-widest text-blue-550 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  User Messages
                </h2>
                <p className="text-blue-450 text-xs mt-1">
                  {contacts.length} message{contacts.length !== 1 ? 's' : ''} received
                </p>
              </div>
              <button
                onClick={fetchContacts}
                className="text-blue-600 hover:text-blue-800 transition p-2 hover:bg-blue-50 rounded-lg"
                disabled={loadingContacts}
              >
                <RefreshCw className={`w-4 h-4 ${loadingContacts ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Contacts List */}
            {loadingContacts ? (
              <div className="text-center py-8 text-blue-400">Loading messages...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-blue-400">No messages received yet</div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="border border-blue-50 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h3 className="font-bold text-blue-900">{contact.name}</h3>
                          <span className="text-sm text-blue-500">{contact.email}</span>
                          <span className="text-xs text-blue-300">•</span>
                          <span className="text-xs text-blue-400">{contact.subject}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{contact.message}</p>
                        {contact.professionalReg && (
                          <p className="text-xs text-blue-400 mt-1">
                            Reg: {contact.professionalReg}
                          </p>
                        )}
                        <p className="text-xs text-blue-300 mt-2">
                          {new Date(contact.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      <button
                        onClick={() => setDeleteConfirm({ id: contact._id, name: contact.name })}
                        className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-lg ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environment Info */}
          <div className="lg:col-span-2 border border-blue-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-blue-550 mb-4">Environment Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'API Endpoints', value: import.meta.env.VITE_API_URL || 'http://localhost:4000' },
                { label: 'System Mode', value: import.meta.env.MODE || 'development' },
                { label: 'Core Version', value: '1.0.0-stable' },
              ].map((item, i) => (
                <div key={i} className="bg-blue-50/20 border border-blue-50 rounded-lg p-3">
                  <p className="text-[13px] font-bold uppercase text-blue-500 mb-1">{item.label}</p>
                  <p className="text-xs font-medium text-blue-800 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Message?</h3>
                <p className="text-sm text-gray-500 mt-1">Cannot undo</p>
              </div>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700">
                <span className="font-semibold">From:</span> {deleteConfirm.name}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => deleteContact(deleteConfirm.id)}
                disabled={deletingId === deleteConfirm.id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === deleteConfirm.id ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;