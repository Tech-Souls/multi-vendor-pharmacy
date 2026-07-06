import { useState } from 'react';
import { FileText, Layout, Image, Sliders, Info } from 'lucide-react';
import { MdSettings } from 'react-icons/md';

import PrescriberPosts  from '../components/PrescriberPosts';
import FooterSetting    from './FooterSettings';
import MediaManager     from '../components/MediaManager';
import SliderManager    from '../components/SliderManager';
import AboutSettings    from './AboutSetting';

const PrescriberSettings = () => {
  const [activeSubView, setActiveSubView] = useState('posts');

  const options = [
    { id: 'posts',          title: 'Manage Posts',   icon: FileText  },
    { id: 'about-settings', title: 'About Settings', icon: Info      },
    { id: 'slider-manager', title: 'Slider Manager', icon: Sliders   },
    { id: 'footer-settings',title: 'Edit Footer',    icon: Layout    },
    { id: 'media-manager',  title: 'Media Manager',  icon: Image     },
  ];

  const renderSubView = () => {
    switch (activeSubView) {
      case 'posts':           return <PrescriberPosts />;
      case 'about-settings':  return <AboutSettings />;
      case 'slider-manager':  return <SliderManager />;
      case 'footer-settings': return <FooterSetting />;
      case 'media-manager':   return <MediaManager />;
      default:                return null;
    }
  };

  const activeOption = options.find(o => o.id === activeSubView);

  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-8 py-5 pt-18 sm:pt-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <MdSettings size={17} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800">Settings Configuration</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage posts, sliders, footer and media assets
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 space-y-5">

        {/* ── Tab Navigation ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {options.map(({ id, title, icon: Icon }) => {
            const isActive = activeSubView === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSubView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={13} />
                {title}
              </button>
            );
          })}
        </div>

        {/* ── Active Section Header ── */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {activeOption?.title}
          </p>
        </div>

        {/* ── Content Area ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {renderSubView()}
        </div>

      </div>
    </div>
  );
};

export default PrescriberSettings;