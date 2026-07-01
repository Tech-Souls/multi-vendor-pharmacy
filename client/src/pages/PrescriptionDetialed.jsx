import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  PencilLine, 
  Link, 
  Inbox, 
  History, 
  Settings 
} from 'lucide-react';

const PrescriptionDetailed = () => {
  const tabs = [
    { name: 'Issue Prescription', path: '/prescription-form', icon: PencilLine },
    { name: 'PrescribeLink™',     path: '/prescriberLink',    icon: Link },
   
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) => `
                relative flex items-center py-5 px-1 text-sm font-bold transition-all duration-200 whitespace-nowrap group
                ${isActive ? 'text-slate-600' : 'text-slate-500 hover:text-slate-600'}
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Real Lucide Icon */}
                  <tab.icon 
                    className={`w-4 h-4 mr-2 transition-colors ${
                      isActive ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-500'
                    }`} 
                  />
                  
                  <span>{tab.name}</span>

                  {/* Active Underline Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-600 rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-50 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default PrescriptionDetailed;