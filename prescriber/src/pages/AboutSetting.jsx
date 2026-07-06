import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const AboutSettings = () => {
  const initialState = {
    aboutUs:       { title: 'About Us', description: '' },
    ourVision:     { title: 'Our Vision', description: '' },
    ourServices:   { title: 'Our Services', description: '', servicesList: [] },
    whyChooseUs:   { title: 'Why Choose Us', points: [] },
    ourTeam:       { title: 'Our Team', members: [] },
    ourCommitment:{ title: 'Our Commitment', description: '' }
  };

  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPoint, setNewPoint] = useState('');
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    setFormData(initialState);
    setNewPoint('');
    setNewMember('');
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/about', formData);
      toast.success('About page saved successfully!');
      setFormData(initialState);
      setNewPoint('');
      setNewMember('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const addServiceItem = () =>
    setFormData(prev => ({
      ...prev,
      ourServices: {
        ...prev.ourServices,
        servicesList: [...prev.ourServices.servicesList, { title: '' }]
      }
    }));

  const removeServiceItem = (index) =>
    setFormData(prev => ({
      ...prev,
      ourServices: {
        ...prev.ourServices,
        servicesList: prev.ourServices.servicesList.filter((_, i) => i !== index)
      }
    }));

  const updateServiceItem = (index, value) => {
    const updated = [...formData.ourServices.servicesList];
    updated[index] = { ...updated[index], title: value };
    setFormData(prev => ({ ...prev, ourServices: { ...prev.ourServices, servicesList: updated } }));
  };

  const addPoint = () => {
    if (!newPoint.trim()) return;
    setFormData(prev => ({
      ...prev,
      whyChooseUs: { ...prev.whyChooseUs, points: [...prev.whyChooseUs.points, { title: newPoint.trim() }] }
    }));
    setNewPoint('');
  };

  const removePoint = (index) =>
    setFormData(prev => ({
      ...prev,
      whyChooseUs: { ...prev.whyChooseUs, points: prev.whyChooseUs.points.filter((_, i) => i !== index) }
    }));

  const addMember = () => {
    if (!newMember.trim()) return;
    setFormData(prev => ({
      ...prev,
      ourTeam: { ...prev.ourTeam, members: [...prev.ourTeam.members, { title: newMember.trim() }] }
    }));
    setNewMember('');
  };

  const removeMember = (index) =>
    setFormData(prev => ({
      ...prev,
      ourTeam: { ...prev.ourTeam, members: prev.ourTeam.members.filter((_, i) => i !== index) }
    }));

  const getDisplayValue = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.title || item.name || item.text || '';
  };

   if (loading) return (
    <div className="flex items-center justify-center py-16 min-h-[50vh]">
      ...
    </div>
  );

  return (
    <div className="p-4 sm:p-8 max-w-2xl  text-slate-600 overflow-hidden">
     <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-slate-800">About Page Configuration</h1>
      <div className="space-y-3">

        {[
          { key: 'aboutUs', title: 'About Us', descLabel: 'Description', field: 'description' },
          { key: 'ourVision', title: 'Our Vision', descLabel: 'Vision Statement', field: 'description' },
          { key: 'ourCommitment', title: 'Our Commitment', descLabel: 'Commitment Statement', field: 'description' }
        ].map((section) => (
          <div key={section.key} className="border-b border-gray-100 pb-1">
            <h2 className="text-md font-semibold text-slate-800 mb-2">{section.title}</h2>
            <div className="space-y-3">
              <div>
                <input type="text" className="w-full border border-gray-200 px-3 py-2 rounded-md focus:border-teal-600 outline-none text-sm transition-colors"
                  value={formData[section.key].title}
                  onChange={e => setFormData({ ...formData, [section.key]: { ...formData[section.key], title: e.target.value } })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{section.descLabel}</label>
                <textarea className="w-full border border-gray-200 px-3 py-2 rounded-md focus:border-teal-600 outline-none text-sm transition-colors resize-none" rows="3"
                  value={formData[section.key][section.field]}
                  onChange={e => setFormData({ ...formData, [section.key]: { ...formData[section.key], [section.field]: e.target.value } })} />
              </div>
            </div>
          </div>
        ))}

        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-md font-semibold text-slate-800 mb-4">Our Services</h2>
          <div className="mb-2">
            <input type="text" className="w-full border border-gray-200 px-3 py-2 rounded-md focus:border-teal-600 outline-none text-sm transition-colors"
              value={formData.ourServices.title}
              onChange={e => setFormData({ ...formData, ourServices: { ...formData.ourServices, title: e.target.value } })} />
          </div>
          <div className="space-y-2">
            {formData.ourServices.servicesList.map((service, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input className="border border-gray-200 px-3 py-2 rounded-md text-sm flex-1 focus:border-teal-600 outline-none"
                  value={getDisplayValue(service)}
                  onChange={e => updateServiceItem(index, e.target.value)} />
                <button type="button" onClick={() => removeServiceItem(index)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addServiceItem} className="text-xs text-teal-600 font-bold uppercase mt-2">+ Add Service</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-md font-semibold text-slate-800 mb-4">Why Choose Us</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Add point..." className="border border-gray-200 px-3 py-2 rounded-md text-sm flex-1 focus:border-teal-600 outline-none"
                value={newPoint} onChange={e => setNewPoint(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPoint()} />
              <button type="button" onClick={addPoint} className="text-xs font-bold uppercase text-teal-600">Add</button>
            </div>
            <ul className="space-y-2">
              {formData.whyChooseUs.points.map((point, index) => (
                <li key={index} className="flex justify-between items-center text-sm border border-gray-100 px-3 py-2 rounded-md">
                  <span>{getDisplayValue(point)}</span>
                  <button type="button" onClick={() => removePoint(index)} className="text-gray-300 hover:text-red-500">✕</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-md font-semibold text-slate-800 mb-4">Our Team</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Add member..." className="border border-gray-200 px-3 py-2 rounded-md text-sm flex-1 focus:border-teal-600 outline-none"
                value={newMember} onChange={e => setNewMember(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} />
              <button type="button" onClick={addMember} className="text-xs font-bold uppercase text-teal-600">Add</button>
            </div>
            <ul className="space-y-2">
              {formData.ourTeam.members.map((member, index) => (
                <li key={index} className="flex justify-between items-center text-sm border border-gray-100 px-3 py-2 rounded-md">
                  <span>{getDisplayValue(member)}</span>
                  <button type="button" onClick={() => removeMember(index)} className="text-gray-300 hover:text-red-500">✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
<div className="pt-4 flex justify-center">
  <button 
    type="button" 
    onClick={handleSave} 
    disabled={saving}
    className="w-full md:w-auto px-4 py-3 bg-slate-900 text-white text-sm font-bold  rounded-md hover:bg-black transition-all disabled:opacity-50"
  >
    {saving ? 'Saving...' : 'Save All Changes'}
  </button>
</div>

      </div>
    </div>
  );
};

export default AboutSettings;