import { useState, useEffect, useRef } from 'react';
import UserMenu from './UserMenu';

const TopBar = ({ 
  onMenuClick, 
  searchInput, 
  onSearchChange, 
  searchType, 
  onSearchTypeChange, 
  onAnalyze, 
  isAnalyzing,
  onLogout,
  alertsCount,
  activeTab,
  onTabChange,
  navItems
}) => {
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [credits, setCredits] = useState(250);
  
  const searchTypeRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickActionsRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(event.target)) {
        setSearchTypeDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
        setSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && searchExpanded) {
        setSearchExpanded(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [searchExpanded]);

  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => {
        setCredits(prev => Math.max(0, prev - 1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  const getSearchTypeIcon = (type) => {
    const color = '#00E5FF';
    switch(type) {
      case "url": return (
        <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      case "email": return (
        <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case "file": return (
        <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      default: return null;
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      setMobileSearchOpen(true);
      setTimeout(() => {
        const input = document.getElementById('mobile-search-input');
        if (input) input.focus();
      }, 200);
    }
  };

  return (
    <header className="flex flex-col bg-[#0a0a0a] border-b border-white/[0.06] relative z-[9998]" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 sm:px-7 lg:px-10 py-4 gap-2 sm:gap-4">
        
        {/* Left Section - Logo */}
        <div className="flex items-center gap-2 sm:gap-6 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF]"></span>
            </span>
            <h1 className="font-black text-xl sm:text-2xl md:text-3xl text-white whitespace-nowrap tracking-[-0.02em]">
              Weekey<span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text text-transparent">Osint</span>
            </h1>
          </div>

          {/* Desktop Search Bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl relative z-[9999]">
            <div className="w-full flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl focus-within:border-[#00E5FF]/40 focus-within:bg-white/[0.05] transition-all duration-200 overflow-hidden">
              {/* Search Type Dropdown */}
              <div className="relative" ref={searchTypeRef}>
                <button 
                  onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                  className="px-5 py-3 text-white/50 hover:text-[#00E5FF] flex items-center gap-2.5 border-r border-white/[0.06] transition-colors font-bold text-xs uppercase tracking-wider"
                >
                  <span>{getSearchTypeIcon(searchType)}</span>
                  <span className="text-xs uppercase">{searchType}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {searchTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-[#0a0a0a] border border-white/[0.08] rounded-xl shadow-2xl z-[10000] overflow-hidden backdrop-blur-xl">
                    {['url', 'email', 'file'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          onSearchTypeChange(type);
                          setSearchTypeDropdownOpen(false);
                        }}
                        className="w-full px-5 py-3 text-left text-white/50 hover:text-[#00E5FF] hover:bg-white/[0.04] capitalize flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        {getSearchTypeIcon(type)}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`ENTER ${searchType.toUpperCase()} TO ANALYZE...`}
                className="flex-1 px-5 py-3 bg-transparent text-white placeholder-white/20 focus:outline-none text-sm font-medium w-full min-w-0"
                onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
              />

              {/* Analyze Button */}
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || credits <= 0}
                className="px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold text-xs uppercase tracking-wider hover:from-[#00D4EB] hover:to-[#28C4B0] transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>SCANNING</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Credits Counter */}
          <div className="relative group">
            <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00E5FF]/30 transition-all flex items-center gap-1.5 sm:gap-2.5">
              <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-bold text-sm sm:text-base">{credits}</span>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f87171] text-[9px] flex items-center justify-center text-white font-bold rounded-full">{alertsCount}</span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-2xl z-[10000] overflow-hidden backdrop-blur-xl">
                <div className="p-5 border-b border-white/[0.06]">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {credits === 0 && (
                    <div className="p-5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]">
                      <p className="text-white text-xs font-bold uppercase">❌ no credits</p>
                      <p className="text-white/30 text-[10px] font-medium mt-1">purchase more to continue</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button 
            onClick={toggleSearch}
            className="md:hidden p-2 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* User Menu */}
          <UserMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[10000] md:hidden" ref={mobileSearchRef}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={toggleSearch} className="p-2 text-white/50 hover:text-[#00E5FF]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">search</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl focus-within:border-[#00E5FF]/40 overflow-hidden">
                <div className="relative" ref={searchTypeRef}>
                  <button 
                    onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                    className="px-4 py-3 text-white/50 hover:text-[#00E5FF] flex items-center gap-2 border-r border-white/[0.06]"
                  >
                    <span>{getSearchTypeIcon(searchType)}</span>
                    <span className="text-xs uppercase">{searchType}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <input
                  id="mobile-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={`enter ${searchType} to analyze...`}
                  className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/20 focus:outline-none text-sm font-medium"
                  onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
                />
              </div>
              
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || credits <= 0}
                className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] text-black font-bold text-xs uppercase tracking-wider rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>scanning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>start scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar - Mobile Optimized with Larger Icons */}
      <div className="px-1 sm:px-7 lg:px-10 border-t border-white/[0.04]">
        <nav className="flex justify-center sm:justify-start items-center gap-0 sm:gap-1 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => onTabChange(item.id)} 
                className="relative group py-1 sm:py-2 flex-1 sm:flex-none flex justify-center"
              >
                <div className={`flex items-center justify-center gap-0 sm:gap-2.5 px-1 sm:px-6 rounded-lg transition-all duration-200 py-1.5 sm:py-2 ${
                  isActive 
                    ? 'text-[#00E5FF] bg-[#00E5FF]/8' 
                    : 'text-white/35 hover:text-white hover:bg-white/[0.03]'
                }`}>
                  <span className="text-current w-10 h-10 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-110 flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider hidden sm:inline">{item.label}</span>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 sm:w-8 h-[2px] bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopBar;