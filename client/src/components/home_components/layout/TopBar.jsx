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
    const color = '#00ff88';
    switch(type) {
      case "url": return (
        <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      case "email": return (
        <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case "file": return (
        <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
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
    <header className="flex flex-col bg-[#080b0d] border-b border-white/10 relative z-[9998]">
      
      {/* Top Row */}
      <div className="flex items-center justify-between px-5 sm:px-7 lg:px-10 py-3 gap-4">
        
        {/* Left Section - Logo */}
        <div className="flex items-center gap-5 flex-1">
          <div className="flex items-center gap-3 flex-shrink-0">
            <h1 className="font-display text-xl md:text-2xl font-bold text-white whitespace-nowrap">
              OSINT<span className="text-[#00ff88]">Weekeyv</span>
            </h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-xl relative z-[9999]">
            <div className="w-full flex items-center border border-white/10 focus-within:border-[#00ff88]/50 transition-all">
              {/* Search Type Dropdown */}
              <div className="relative" ref={searchTypeRef}>
                <button 
                  onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                  className="px-4 py-2.5 text-white/60 hover:text-[#00ff88] flex items-center gap-2 border-r border-white/10 transition-colors font-mono text-[11px] uppercase tracking-[0.08em]"
                >
                  <span className="hidden sm:block">{getSearchTypeIcon(searchType)}</span>
                  <span className="text-[11px] uppercase">{searchType}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {searchTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-[#090c0e] border border-white/10 shadow-2xl z-[10000] overflow-hidden">
                    {['url', 'email', 'file'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          onSearchTypeChange(type);
                          setSearchTypeDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-white/60 hover:text-[#00ff88] hover:bg-white/5 capitalize flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em]"
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
                className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm font-mono w-full min-w-0"
                onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
              />

              {/* Analyze Button */}
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || credits <= 0}
                className="px-5 py-2 m-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#00ff88]/20 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>SCAN</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden flex items-center" ref={mobileSearchRef}>
          {!searchExpanded ? (
            <button onClick={toggleSearch} className="p-2.5 text-white/60 hover:text-[#00ff88] transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          ) : (
            <div className="fixed inset-x-0 top-16 z-[10000] bg-[#080b0d] border-b border-white/10 animate-slideDown p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center border border-white/10 focus-within:border-[#00ff88]/50">
                  <div className="relative" ref={searchTypeRef}>
                    <button onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)} className="px-4 py-2.5 text-white/60 hover:text-[#00ff88] flex items-center gap-1 border-r border-white/10">
                      {getSearchTypeIcon(searchType)}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {searchTypeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-32 bg-[#090c0e] border border-white/10 z-[10000]">
                        {['url', 'email', 'file'].map((type) => (
                          <button key={type} onClick={() => { onSearchTypeChange(type); setSearchTypeDropdownOpen(false); }} className="w-full px-4 py-2.5 text-left text-white/60 hover:text-[#00ff88] hover:bg-white/5 text-[11px] font-mono uppercase flex items-center gap-2">
                            {getSearchTypeIcon(type)}<span>{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input id="mobile-search-input" type="text" value={searchInput} onChange={(e) => onSearchChange(e.target.value)} placeholder="ENTER TARGET..." className="flex-1 px-4 py-2.5 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm font-mono" onKeyPress={(e) => e.key === 'Enter' && onAnalyze()} autoFocus />
                </div>
                <button onClick={onAnalyze} disabled={isAnalyzing || credits <= 0} className="px-4 py-2.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[10px] uppercase tracking-[0.08em] disabled:opacity-50">
                  {isAnalyzing ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>}
                </button>
                <button onClick={toggleSearch} className="p-2.5 text-white/60 hover:text-[#00ff88]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Credits Counter */}
          <div className="relative group">
            <button className="px-4 py-2 border border-[#00ff88]/30 hover:border-[#00ff88] transition-all flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-mono text-sm font-bold">{credits}</span>
              <span className="text-white/30 text-[9px] font-mono uppercase hidden sm:inline">CREDITS</span>
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-[#090c0e] border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
              <div className="p-4">
                <p className="text-white text-[11px] font-mono uppercase tracking-[0.08em] mb-1">AVAILABLE CREDITS</p>
                <p className="text-[#00ff88] font-mono text-xl font-bold">{credits}</p>
                <p className="text-white/30 text-[9px] font-mono mt-2">1 CREDIT = 1 SCAN</p>
                {credits < 50 && credits > 0 && <p className="text-[#fbbf24] text-[9px] font-mono mt-1">⚠️ LOW CREDITS</p>}
                {credits === 0 && <p className="text-[#f87171] text-[9px] font-mono mt-1">❌ NO CREDITS LEFT</p>}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2.5 text-white/60 hover:text-[#00ff88] transition-all relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f87171] text-[9px] flex items-center justify-center text-white font-mono">{alertsCount}</span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#090c0e] border border-white/10 shadow-2xl z-[10000] overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-mono text-[11px] uppercase tracking-[0.08em]">NOTIFICATIONS</h3>
                    <button className="text-white/30 hover:text-[#00ff88] text-[9px] font-mono uppercase">MARK ALL</button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {credits < 50 && credits > 0 && (
                    <div className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-[#fbbf24]" />
                        <div className="flex-1">
                          <p className="text-white text-[11px] font-mono uppercase">⚠️ LOW CREDITS</p>
                          <p className="text-white/40 text-[9px] font-mono mt-0.5">Only {credits} credits remaining</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {credits === 0 && (
                    <div className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-[#f87171]" />
                        <div className="flex-1">
                          <p className="text-white text-[11px] font-mono uppercase">❌ NO CREDITS</p>
                          <p className="text-white/40 text-[9px] font-mono mt-0.5">Purchase more to continue</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {[1,2].map((i) => (
                    <div key={i} className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-[#00ff88]" />
                        <div className="flex-1">
                          <p className="text-white text-[11px] font-mono uppercase">THREAT DETECTED</p>
                          <p className="text-white/40 text-[9px] font-mono mt-0.5">New findings in recent scan</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <UserMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-5 sm:px-7 lg:px-10 border-t border-white/10">
        <nav className="flex justify-start items-center flex-wrap gap-0 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)} className="relative group py-2.5">
                <div className={`flex items-center gap-2 px-4 sm:px-5 transition-all duration-300 ${isActive ? 'text-[#00ff88]' : 'text-white/40 hover:text-white'}`}>
                  <span className="text-current transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] hidden sm:inline">{item.label}</span>
                </div>
                <span className={`absolute bottom-0 left-0 right-0 h-[1px] bg-[#00ff88] transition-all duration-300 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </nav>
      </div>
    
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
      `}</style>
    </header>
  );
};

export default TopBar;