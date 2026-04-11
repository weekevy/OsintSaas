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
  
  // Refs for click outside detection
  const searchTypeRef = useRef(null);
  const notificationsRef = useRef(null);
  const quickActionsRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Handle click outside for all dropdowns
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

  // Handle escape key to close search
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

  // Deduct credits when scanning
  useEffect(() => {
    if (isAnalyzing) {
      const timer = setTimeout(() => {
        setCredits(prev => Math.max(0, prev - 1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  const getSearchTypeIcon = (type) => {
    switch(type) {
      case "url": return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
      case "email": return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      case "file": return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      default: return null;
    }
  };

  const getQuickActionIcon = (action) => {
    switch(action) {
      case 'Generate Report':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
              stroke="url(#gradient-report)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-report" x1="3.75" y1="12" x2="20.25" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A855F7"/>
                <stop offset="1" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'New Investigation':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-3m0 0h-3m3 0v3m0-3v-3" 
              stroke="url(#gradient-investigation)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-investigation" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Export Data':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" 
              stroke="url(#gradient-export)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-export" x1="3" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#EC4899"/>
                <stop offset="1" stopColor="#A855F7"/>
              </linearGradient>
            </defs>
          </svg>
        );
      case 'Invite Team Member':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" 
              stroke="url(#gradient-team)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient-team" x1="4" y1="12" x2="21" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06B6D4"/>
                <stop offset="1" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
        );
      default:
        return null;
    }
  };

  // Toggle search expansion on mobile
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
    <header className="flex flex-col bg-black/40 backdrop-blur-xl border-b border-white/10 relative z-[9998]">
      
      {/* Top Row - Logo and Search Bar on Left, Actions on Right */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-3">
        
        {/* Left Section - Logo and Search Bar */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative w-9 h-9 overflow-hidden">
              <img 
                src="/src/assets/images/logo6.png" 
                alt="OsintSaas" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              OSINT<span className="text-white">Weekeyv</span>
            </h1>
          </div>

          {/* Desktop Search Bar - Now on the left beside logo */}
          <div className="hidden sm:flex flex-1 max-w-xl relative z-[9999]">
            <div className="w-full flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
              
              {/* Search Type Dropdown */}
              <div className="relative" ref={searchTypeRef}>
                <button 
                  onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                  className="px-3 py-2 text-white/60 hover:text-white flex items-center gap-2 border-r border-white/10 transition-colors"
                >
                  <span className="hidden sm:block">{getSearchTypeIcon(searchType)}</span>
                  <span className="text-sm capitalize">{searchType}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {searchTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-gray-900 rounded-xl border border-white/10 shadow-2xl z-[10000] overflow-hidden">
                    {['url', 'email', 'file'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          onSearchTypeChange(type);
                          setSearchTypeDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-white/70 hover:bg-white/5 hover:text-white capitalize flex items-center gap-2 text-sm"
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
                placeholder={`Enter ${searchType} to analyze...`}
                className="flex-1 px-3 py-2 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm w-full min-w-0"
                onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
              />

              {/* Analyze Button */}
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing || credits <= 0}
                className="px-4 py-2 m-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2 text-sm whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Analyze</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="hidden sm:inline">Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search - Icon that expands */}
        <div className="sm:hidden flex items-center" ref={mobileSearchRef}>
          {!searchExpanded ? (
            <button
              onClick={toggleSearch}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          ) : (
            <div className="fixed inset-x-0 top-16 z-[10000] bg-black/95 backdrop-blur-xl border-b border-white/10 animate-slideDown p-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-purple-500/50 transition-all">
                  {/* Search Type Dropdown */}
                  <div className="relative" ref={searchTypeRef}>
                    <button 
                      onClick={() => setSearchTypeDropdownOpen(!searchTypeDropdownOpen)}
                      className="px-3 py-2.5 text-white/60 hover:text-white flex items-center gap-2 border-r border-white/10 transition-colors"
                    >
                      <span>{getSearchTypeIcon(searchType)}</span>
                      <span className="text-sm capitalize hidden">{searchType}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {searchTypeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-36 bg-gray-900 rounded-xl border border-white/10 shadow-2xl z-[10000] overflow-hidden">
                        {['url', 'email', 'file'].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              onSearchTypeChange(type);
                              setSearchTypeDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-white/70 hover:bg-white/5 hover:text-white capitalize flex items-center gap-2 text-sm"
                          >
                            {getSearchTypeIcon(type)}
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    id="mobile-search-input"
                    type="text"
                    value={searchInput}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={`Enter ${searchType}...`}
                    className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && onAnalyze()}
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={onAnalyze}
                  disabled={isAnalyzing || credits <= 0}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={toggleSearch}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions - Credits, Notifications, User Menu */}
        <div className="flex items-center gap-2">
          
          {/* Credits / Tokens Counter */}
          <div className="relative group">
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-semibold text-sm">{credits}</span>
              <span className="text-white/50 text-xs hidden sm:inline">credits</span>
            </button>
            
            {/* Tooltip on hover */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
              <div className="p-3">
                <p className="text-white text-xs mb-1">Available Credits</p>
                <p className="text-purple-400 font-bold text-lg">{credits}</p>
                <p className="text-white/40 text-xs mt-2">1 credit = 1 scan</p>
                {credits < 50 && credits > 0 && (
                  <p className="text-yellow-500 text-xs mt-1">⚠️ Low credits! Buy more soon.</p>
                )}
                {credits === 0 && (
                  <p className="text-red-500 text-xs mt-1">❌ No credits left! Please purchase.</p>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white ring-2 ring-black">
                {alertsCount}
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-gray-900 to-black rounded-2xl border border-white/10 shadow-2xl z-[10000] overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <button className="text-white/40 hover:text-white text-sm">Mark all as read</button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {credits < 50 && credits > 0 && (
                    <div className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-yellow-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-white text-sm">⚠️ Low credits warning</p>
                          <p className="text-white/40 text-xs mt-1">You have only {credits} credits left</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {credits === 0 && (
                    <div className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-red-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-white text-sm">❌ No credits remaining</p>
                          <p className="text-white/40 text-xs mt-1">Please purchase more credits to continue scanning</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {[1,2,3].map((i) => (
                    <div key={i} className="p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-white text-sm">New threat detected in your recent scan</p>
                          <p className="text-white/40 text-xs mt-1">5 min ago</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10">
                  <button className="w-full text-center text-white/60 hover:text-white text-sm py-2">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <UserMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Navigation Bar - Centered */}
      <div className="px-4 sm:px-6 lg:px-8 border-t border-white/10">
           <nav className="flex justify-start items-center flex-wrap gap-1 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative group py-2"
              >
                <div className={`flex items-center gap-2 px-3 sm:px-4 transition-all duration-300
                  ${isActive 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="text-current transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
                </div>
                
                {/* Active Indicator - Bottom Border Only */}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300
                  ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}
                />
              </button>
            );
          })}
        </nav>
      </div>
    
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </header>
  );
};

export default TopBar;