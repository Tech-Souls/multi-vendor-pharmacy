import { BiSearch, BiDownload, BiPlus, BiBell } from 'react-icons/bi';

const Header = ({ title }) => {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 bg-white border-b border-slate-100 sticky top-0 z-50 gap-2 sm:gap-4">
      
      {/* Left side - Title with dynamic spacing for hamburger */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-fit shrink-0 md:pl-0 pl-10">
        {/* pl-10 on mobile (<768px) creates space for hamburger */}
        {/* md:pl-0 removes spacing on desktop (>=768px) */}
        <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-black rounded-full shrink-0" />
        <div>
          <h1 className="text-sm sm:text-base md:text-lg font-black text-black tracking-tight leading-none whitespace-nowrap">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side - all icons and buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-fit ml-auto">
        
        {/* Search - hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex items-center relative group">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={16} />
          <input
            type="text"
            placeholder="search..."
            className="w-32 lg:w-48 xl:w-64 pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all shadow-sm"
          />
        </div>

        {/* Mobile search icon */}
        <button className="md:hidden w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center border border-slate-200 text-black rounded-lg hover:border-black hover:bg-slate-50 transition-all">
          <BiSearch size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>

        {/* Export button - text hidden on very small screens */}
        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-widest border border-slate-200 text-black rounded-lg hover:bg-slate-50 hover:border-black transition-all shadow-sm whitespace-nowrap">
          <BiDownload size={13} className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px]" /> 
          <span className="hidden sm:inline">export</span>
        </button>
        
        {/* New entry button - text hidden on very small screens */}
        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-widest bg-black hover:bg-slate-800 text-white rounded-lg transition-all shadow-md whitespace-nowrap">
          <BiPlus size={13} className="sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px]" /> 
          <span className="hidden xs:inline">new entry</span>
        </button>

        {/* Divider - hidden on mobile */}
        <div className="hidden sm:block w-px h-6 sm:h-7 md:h-8 bg-slate-100 mx-0 sm:mx-1 md:mx-2" />

        {/* Bell icon */}
        <button className="relative w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 flex items-center justify-center border border-slate-200 text-black rounded-lg hover:border-black hover:bg-slate-50 transition-all">
          <BiBell size={18} className="sm:w-[20px] sm:h-[20px] md:w-[22px] md:h-[22px]" />
          <span className="absolute top-1.5 sm:top-2 md:top-2.5 right-1.5 sm:right-2 md:right-2.5 w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 md:h-2.5 bg-black rounded-full border-2 border-white" />
        </button>
      </div>

    </div>
  );
};

export default Header;