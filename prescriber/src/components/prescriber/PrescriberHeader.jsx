import { MdNotifications, MdSearch } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const PrescriberHeader = ({ title, alertCount = 0 }) => {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
      {/* Left section - Title & Subtitle with left padding for hamburger on mobile */}
      <div className="flex-1 min-w-0 pl-12 sm:pl-0">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
          {title}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-1">
          <span className="truncate">{user?.prescriberId}</span>
          <span className="hidden xs:inline">·</span>
        </p>
      </div>

      {/* Right section - Search, Alerts, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Desktop Search - visible on sm and up */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <MdSearch className="text-gray-400 flex-shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 outline-none w-32 md:w-36 lg:w-40 placeholder-gray-400"
          />
        </div>

        {/* Mobile Search - toggleable search bar */}
        <div className="sm:hidden flex items-center gap-2">
          {isSearchOpen ? (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 animate-in slide-in-from-right duration-200">
              <MdSearch className="text-gray-400 flex-shrink-0" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-700 outline-none w-32 placeholder-gray-400"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
              aria-label="Search"
            >
              <MdSearch size={20} />
            </button>
          )}
        </div>

        {/* Alerts bell */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 flex-shrink-0">
          <MdNotifications size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white
              text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
      </div>
    </div>
  );
};

export default PrescriberHeader;