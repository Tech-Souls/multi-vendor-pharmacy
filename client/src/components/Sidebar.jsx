import React, { useState, useEffect } from "react";
import { BiMenu, BiX } from 'react-icons/bi';

const navItems = [
  {
    section: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "" },
      { id: "analytics", label: "Analytics", icon: "" },
    ]
  },
  {
    section: "OPERATIONS",
    items: [
      { id: "orders", label: "Orders", icon: "",  },
      { id: "prescriptions", label: "Prescriptions", icon: "",  },
      { id: "products", label: "Products", icon: "" },
      { id: "customers", label: "Customers", icon: "" },
      { id: "stock", label: "Stock Allocation", icon: "" },
    ]
  },
  {
    section: "FINANCE",
    items: [
      { id: "onepot", label: "OnePort System", icon: "" },
      { id: "invoices", label: "Invoices", icon: "" },
      { id: "commission", label: "Commission", icon: "" },
    ]
  },
  {
    section: "SYSTEM",
    items: [
      { id: "sliders", label: "SliderManager", icon: "" },
      { id: "settings", label: "Settings", icon: "" },
      { id: "livesite", label: "View Live Site", icon: "" },
    ]
  },
];

const Sidebar = ({ activePage, setActivePage }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isMobileOpen) {
        const sidebar = document.getElementById('sidebar-container');
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (sidebar && !sidebar.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
          setIsMobileOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  const sidebarContent = (
    <div className="w-[220px] min-w-[220px] h-full bg-[#0f1117] flex flex-col">

      <div className="px-4 py-5 border-b border-white/10 pl-15 md:pl-4">
  <p className="text-white font-medium text-[15px] tracking-tight">DrGPharma</p>
  <p className="text-white/40 text-[11px] mt-0.5">Management Console</p>
  <span className="mt-2 inline-block text-[10px] font-medium bg-blue-900/60 text-blue-400 px-2 py-0.5 rounded tracking-wide uppercase">
    Admin
  </span>
</div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-3">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-4 mt-4 mb-1 text-[10px] font-medium text-white/30 tracking-widest uppercase">
              {group.section}
            </p>
            {group.items.map((item) => (
              item.id === "livesite" ? (
                <a
                  key={item.id}
                  href="https://sites.super.myninja.ai/1a773921-511c-4eb7-90af-872b38ab0caf/3a890fad/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/50 hover:bg-white/5 hover:text-white/90 border-l-2 border-transparent transition-all duration-150"
                  onClick={() => isMobile && setIsMobileOpen(false)}
                >
                  <span className="text-[15px] w-5 text-center">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (isMobile) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all duration-150
                    ${activePage === item.id
                      ? 'bg-white/10 text-white border-l-2 border-blue-500'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/90 border-l-2 border-transparent'
                    }`}
                >
                  <span className="text-[15px] w-5 text-center">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            ))}
          </div>
        ))}
      </nav>
      
      {/* Profile Footer */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-900/60 text-blue-400 text-[12px] font-medium flex items-center justify-center shrink-0">
          AD
        </div>
        <div>
          <p className="text-white text-[12px] font-medium">Admin</p>
          <p className="text-white/35 text-[10px]">DrGPharma · Time Pharmacy</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed left-3 z-[100] w-9 h-9 flex items-center justify-center bg-[#0f1117] text-white rounded-lg border border-white/10 hover:bg-slate-800 transition-all shadow-lg"
        style={{ top: '9px' }}
      >
        {isMobileOpen ? <BiX size={20} /> : <BiMenu size={20} />}
      </button>

      {/* Sidebar Container */}
      <div
        id="sidebar-container"
        className={`
          fixed md:sticky top-0 left-0 z-[60]
          transition-transform duration-300 ease-in-out
          h-screen
          ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        <div className="h-full">
          {sidebarContent}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;