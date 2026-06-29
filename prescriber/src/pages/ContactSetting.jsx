import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { Phone, Mail, Clock, MapPin, Trash2, MessageSquare, Settings } from 'lucide-react';

// ✅ Empty state — fields always start blank
const EMPTY = { number: '', timings: '', address: '', clinicEmail: '' };

const ContactSetting = () => {
  const [clinicData, setClinicData] = useState(EMPTY);  // ✅ always empty on mount
  const [messages, setMessages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Only fetch messages — never pre-fill clinic form
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgRes = await API.get('/contact/messages');
        if (msgRes.data) setMessages(msgRes.data);
      } catch (err) {
        console.error('Messages fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/contact/clinic', clinicData);
      toast.success('Clinic details updated!');
      setClinicData(EMPTY); // ✅ clear fields after save
    } catch (err) {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast(
        (t) => (
          <div className="flex items-center justify-between gap-6 px-4 py-3 bg-white rounded-2xl shadow-lg min-w-[360px]">
            <div>
              <p className="text-sm font-bold text-gray-800">Delete Message?</p>
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
      await API.delete(`/contact/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      toast.success("Message deleted.");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
    </div>
  );

  const clinicFields = [
    { label: 'Phone Number', key: 'number', icon: Phone, type: 'input' },
    { label: 'Clinic Email', key: 'clinicEmail', icon: Mail, type: 'input' },
    { label: 'Opening Hours', key: 'timings', icon: Clock, type: 'textarea' },
    { label: 'Address', key: 'address', icon: MapPin, type: 'textarea' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Contact Settings</h1>
            <p className="text-sm text-slate-500">Manage clinic details and incoming messages</p>
          </div>
        </div>

        {/* Clinic Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full" />
            <h2 className="text-base font-semibold text-slate-700">Clinic Details</h2>
            <span className="ml-auto text-xs text-slate-400">Update fields you want to change</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinicFields.map(({ label, key, icon: Icon, type }) => (
              <div key={key} className={type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  <Icon size={13} className="text-slate-400" />
                  {label}
                </label>
                {type === 'input' ? (
                  <input
                    value={clinicData[key]}
                    onChange={e => setClinicData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all"
                  />
                ) : (
                  <textarea
                    rows={3}
                    value={clinicData[key]}
                    onChange={e => setClinicData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="px-6 pb-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setClinicData(EMPTY)}
              className="px-4 py-2.5 text-slate-400 hover:text-slate-600 text-sm font-medium transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* User Messages */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquare size={15} className="text-slate-400" />
              User Messages
            </h2>
            <span className="ml-2 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                <MessageSquare size={20} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400 font-medium">No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {messages.map(msg => (
                <div key={msg._id} className="px-6 py-4 hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-slate-600">
                          {msg.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{msg.name}</p>
                        <p className="text-xs text-slate-400">{msg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 ml-12 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ContactSetting;