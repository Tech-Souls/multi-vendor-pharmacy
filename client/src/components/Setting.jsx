import { useState, useEffect } from 'react';
import Header from './Header';
import toast from 'react-hot-toast';
import { Mail, Trash2, RefreshCw, X, Settings, Phone, Building, Save } from 'lucide-react';

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

  const [contactSettings, setContactSettings] = useState({
    pharmacyName: '',
    address: '',
    country: '',
    gphcPremisesNo: '',
    operatingHours: '',
    weekendHours: '',
    pomCutoff: '',
    phoneNumber: '',
    phoneBadge: '',
    email: '',
    emailBadge: ''
  });

  const [savingPharmacy, setSavingPharmacy] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    fetchContacts();
    fetchContactSettings();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await fetch('http://localhost:4000/api/contacts');
      const data = await response.json();
      
      if (response.ok) {
        setContacts(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchContactSettings = async () => {
    setLoadingContact(true);
    try {
      const response = await fetch('http://localhost:4000/api/contact-settings');
      const data = await response.json();
      
      if (response.ok) {
        setContactSettings(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch contact settings');
    } finally {
      setLoadingContact(false);
    }
  };

  const handleSaveContactSettings = async () => {
    setSavingContact(true);
    try {
      const response = await fetch('http://localhost:4000/api/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactSettings),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Contact settings saved successfully');
        setContactSettings(data.data);
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSavingContact(false);
    }
  };

  const deleteContact = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`http://localhost:4000/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Message deleted successfully');
        setContacts(contacts.filter(contact => contact._id !== id));
        setDeleteConfirm(null);
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Network error');
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

        <div className="mb-8 border-b border-blue-50 pb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            System Settings
          </h1>
          <p className="text-blue-450 text-md mt-1">
            Configure pharmacy settings and manage communications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-blue-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'contact'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-blue-400 hover:text-blue-600'
            }`}
          >
            Contact Settings
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
              activeTab === 'financial'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-blue-400 hover:text-blue-600'
            }`}
          >
            Financial Rules
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'messages'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-blue-400 hover:text-blue-600'
            }`}
          >
            Messages <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{contacts.length}</span>
          </button>
        </div>

        {/* Contact Settings Tab */}
        {activeTab === 'contact' && (
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-md font-bold uppercase tracking-widest text-blue-550">Contact Page Settings</h2>
            </div>

            {loadingContact ? (
              <div className="text-center py-8 text-blue-400">Loading settings...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Pharmacy Information
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Pharmacy Name</label>
                    <input
                      type="text"
                      value={contactSettings.pharmacyName || ''}
                      onChange={(e) => setContactSettings({...contactSettings, pharmacyName: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Address</label>
                    <input
                      type="text"
                      value={contactSettings.address || ''}
                      onChange={(e) => setContactSettings({...contactSettings, address: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Country</label>
                    <input
                      type="text"
                      value={contactSettings.country || ''}
                      onChange={(e) => setContactSettings({...contactSettings, country: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">GPhC Premises No</label>
                    <input
                      type="text"
                      value={contactSettings.gphcPremisesNo || ''}
                      onChange={(e) => setContactSettings({...contactSettings, gphcPremisesNo: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={contactSettings.operatingHours || ''}
                      onChange={(e) => setContactSettings({...contactSettings, operatingHours: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Weekend Hours</label>
                    <input
                      type="text"
                      value={contactSettings.weekendHours || ''}
                      onChange={(e) => setContactSettings({...contactSettings, weekendHours: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">POM Cut-off</label>
                    <input
                      type="text"
                      value={contactSettings.pomCutoff || ''}
                      onChange={(e) => setContactSettings({...contactSettings, pomCutoff: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={contactSettings.phoneNumber || ''}
                      onChange={(e) => setContactSettings({...contactSettings, phoneNumber: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Phone Badge</label>
                    <input
                      type="text"
                      value={contactSettings.phoneBadge || ''}
                      onChange={(e) => setContactSettings({...contactSettings, phoneBadge: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Email</label>
                    <input
                      type="text"
                      value={contactSettings.email || ''}
                      onChange={(e) => setContactSettings({...contactSettings, email: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-500 uppercase mb-1">Email Badge</label>
                    <input
                      type="text"
                      value={contactSettings.emailBadge || ''}
                      onChange={(e) => setContactSettings({...contactSettings, emailBadge: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-50">
              <button
                onClick={handleSaveContactSettings}
                disabled={savingContact}
                className="px-6 py-3 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingContact ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Reset all contact settings to default?')) {
                    try {
                      await fetch('http://localhost:4000/api/contact-settings/reset', {
                        method: 'DELETE',
                      });
                      await fetchContactSettings();
                      toast.success('Settings reset to default');
                    } catch (error) {
                      toast.error('Failed to reset settings');
                    }
                  }
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}

        {/* Financial Rules Tab */}
        {activeTab === 'financial' && (
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

            <div className="space-y-4 max-w-md">
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
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="border border-blue-100 rounded-xl p-6 shadow-sm">
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
        )}
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