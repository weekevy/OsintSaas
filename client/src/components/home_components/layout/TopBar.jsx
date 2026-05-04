import { useState, useEffect, useRef } from 'react';
import UserMenu from './UserMenu';

const shellMax = 'max-w-[1680px] mx-auto w-full';

const TopBar = ({
  onMenuClick,
  onSearchChange,
  searchType,
  onSearchTypeChange,
  onAnalyze,
  isAnalyzing,
  onLogout,
  alertsCount,
  activeTab,
  onTabChange,
  navItems,
  selectedProject,
}) => {
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [credits, setCredits] = useState(250);

  const searchTypeRef = useRef(null);
  const notificationsRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(event.target)) {
        setSearchTypeDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
        setSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        setCredits((prev) => Math.max(0, prev - 1));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing]);

  const getSearchTypeIcon = (type, compact = false) => {
    const color = '#00E5FF';
    const sz = compact ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6';
    switch (type) {
      case 'url':
        return (
          <svg className={sz} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'email':
        return (
          <svg className={sz} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 0 -2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'file':
        return (
          <svg className={sz} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
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

  const runAnalyze = () => onAnalyze();

  const onSearchKeyDown = (e) => {
    if (e.key === 'Enter') runAnalyze();
  };

  return (
    <header className="sticky top-0 z-[9998] flex flex-col font-sans border-b border-white/[0.08] bg-[#080a0d] max-md:backdrop-blur-none md:bg-[#080a0d]/90 md:backdrop-blur-md md:ring-1 md:ring-white/[0.04]">
      {/* Top row */}
      <div className={`${shellMax} flex flex-wrap items-center justify-between gap-x-2 gap-y-3 px-3 sm:px-5 lg:px-8 py-3 sm:py-3.5`}>
        {/* Brand + project - LEFT SIDE (always on left) */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <span className="relative flex h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5FF] sm:h-2.5 sm:w-2.5" />
            </span>
            <h1
              className="cursor-pointer truncate text-lg font-semibold tracking-tight text-white sm:text-xl md:text-2xl"
              onClick={() => onTabChange('dashboard')}
            >
              Weekey
              <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text font-semibold text-transparent">
                Osint
              </span>
            </h1>
          </div>

          {selectedProject && (
            <div
              className="hidden min-w-0 md:flex md:max-w-[140px] lg:max-w-[200px] xl:max-w-[240px] items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 lg:gap-2.5 lg:px-3 lg:py-2"
              title={selectedProject.name}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#00E5FF]/75 lg:text-[10px]">
                  Project
                </span>
                <span className="block truncate text-[11px] font-medium text-white/90 lg:text-xs">
                  {selectedProject.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center space - empty, pushing actions to the right */}
        <div className="flex-1"></div>

        {/* Actions - RIGHT SIDE (credits, notifications, profile) - ALWAYS on right side */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-2 py-2 transition-colors hover:border-[#00E5FF]/30 hover:bg-white/[0.06] sm:gap-2.5 sm:px-3 sm:py-2"
            aria-label={`${credits} tokens remaining`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00E5FF]/12 ring-1 ring-[#00E5FF]/25 sm:h-9 sm:w-9">
              <svg className="h-4 w-4 text-[#00E5FF] sm:h-[18px] sm:w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tabular-nums text-white sm:hidden">{credits}</span>
            <div className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-sm font-semibold tabular-nums text-white">{credits}</span>
              <span className="text-[9px] font-medium uppercase tracking-wider text-[#00E5FF]/65">tokens</span>
            </div>
          </button>

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-xl border border-white/[0.1] bg-white/[0.04] p-2.5 text-white/55 transition-colors hover:border-[#00E5FF]/25 hover:text-[#00E5FF] sm:p-3"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {alertsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[10px] font-bold text-white">
                  {alertsCount > 99 ? '99+' : alertsCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 z-[10000] mt-2 w-[min(100vw-1.5rem,20rem)] rounded-2xl border border-white/[0.1] bg-[#0c0e12] shadow-2xl sm:w-80 md:backdrop-blur-sm">
                <div className="border-b border-white/[0.08] px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {credits === 0 ? (
                    <div className="border-b border-white/[0.06] p-4 transition-colors hover:bg-white/[0.03]">
                      <p className="text-xs font-semibold text-white">No credits</p>
                      <p className="mt-1 text-[11px] text-white/45">Purchase more to continue scanning.</p>
                    </div>
                  ) : (
                    <p className="p-4 text-[13px] text-white/45">You&apos;re all caught up.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <UserMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Tab nav: mobile = floating curved bar; md+ = segmented pills */}
      <div
        className={[
          'max-md:fixed max-md:z-[9990]',
          'max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-max max-md:max-w-[min(calc(100vw-1.25rem),42rem)]',
          'max-md:bottom-[max(0.65rem,env(safe-area-inset-bottom,0.45rem))]',
          'max-md:rounded-[2rem] max-md:border max-md:border-white/[0.12]',
          'max-md:bg-[#0c0e12] max-md:shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
          'max-md:px-1.5 max-md:py-1',
          'md:border-t md:border-white/[0.08] md:bg-[#080a0d] md:py-2.5',
        ].join(' ')}
      >
        <nav
          className={`mx-auto w-full max-md:w-max max-md:max-w-full px-1 md:px-5 lg:px-8 ${shellMax} max-md:!max-w-none`}
          aria-label="Workspace sections"
        >
          <div
            className={[
              'flex flex-nowrap gap-0.5 overflow-x-auto overflow-y-hidden py-1 scrollbar-hide snap-x snap-mandatory max-md:rounded-[1.75rem]',
              'md:flex-wrap md:gap-1 md:overflow-visible md:snap-none md:rounded-xl md:bg-white/[0.05] md:p-1 md:py-1 md:ring-1 md:ring-white/[0.06]',
            ].join(' ')}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex snap-center flex-col items-center justify-center rounded-2xl md:rounded-lg',
                    'min-w-[2.85rem] shrink-0 px-1.5 py-1 md:min-w-0 md:rounded-lg md:flex-row md:gap-2 md:px-3 md:py-2',
                    'text-[10px] font-semibold tracking-wide md:text-[16px]',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-[#00E5FF]/18 text-[#00E5FF] md:bg-[#00E5FF]/14'
                      : 'text-white/45 active:bg-white/[0.08] md:text-white/50 md:hover:bg-white/[0.06] md:hover:text-white/85',
                  ].join(' ')}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center md:h-7 md:w-7 [&_svg]:!h-[1.35rem] [&_svg]:!w-[1.35rem] md:[&_svg]:!h-5 md:[&_svg]:!w-5">
                    {item.icon}
                  </span>
                  <span className="mt-0.5 hidden max-w-[3.75rem] truncate leading-none md:mt-0 md:inline md:max-w-none">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default TopBar;