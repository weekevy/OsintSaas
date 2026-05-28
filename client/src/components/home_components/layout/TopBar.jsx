import { useState, useEffect, useRef, useCallback } from 'react';
import UserMenu from './UserMenu';
import api from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';

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
  onPricingClick,
}) => {
  const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const credits = user?.credits || 0;

  const searchTypeRef = useRef(null);
  const notificationsRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const projectId = selectedProject?.id;
      const url = projectId ? `/api/notifications?projectId=${projectId}` : '/api/notifications';
      const response = await api.get(url);
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data) => {
      console.log('WS: new_notification', data);
      
      // Prepend to local state for instant "Live" detection
      const newNotif = {
        id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
        title: data.title,
        message: data.message,
        type: data.type || 'threat',
        created_at: data.created_at || new Date().toISOString(),
        is_read: 0,
        scan_id: data.scan_id
      };

      // Ensure we only show if it belongs to current project OR all projects selected
      // Using loosely equal (==) to handle string vs number comparison
      if (!selectedProject?.id || !data.projectId || String(data.projectId) === String(selectedProject.id)) {
        setNotifications(prev => {
          // Prevent duplicates if re-fetch already happened
          if (prev.some(n => n.scan_id === data.scan_id && n.title === data.title)) return prev;
          return [newNotif, ...prev];
        });
      }

      // Small delay to let DB finish then re-sync
      setTimeout(() => fetchNotifications(), 500);
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('scan_completed', () => {
      // Re-fetch when a scan completes to get the result notification
      fetchNotifications();
    });

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('scan_completed');
    };
  }, [socket, isConnected, fetchNotifications, selectedProject?.id]);

  const handleInviteResponse = async (notificationId, action) => {
    try {
      const response = await api.post('/api/notifications/respond', {
        notificationId,
        action
      });
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (action === 'accept' && activeTab === 'team') {
          // If we're on the team tab, trigger a refresh (could use a global event or prop)
          window.location.reload(); 
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to respond to invitation');
    }
  };

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

  const handleClearAllNotifications = async () => {
    try {
      const response = await api.delete('/api/notifications/clear-all');
      if (response.data.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      // Fallback for UI if API fails
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(n => 
    ['success', 'team_invite', 'threat', 'warning'].includes(n.type)
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'threat':
        return (
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'team_invite':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-[100] flex flex-col font-sans border-b border-white/[0.08] bg-[#000000] max-md:backdrop-blur-none md:bg-[#000000]/90 md:backdrop-blur-md md:ring-1 md:ring-white/[0.04]">
      {/* Top row */}
      <div className={`${shellMax} flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-3 sm:px-5 lg:px-8 py-2 sm:py-3.5`}>
        {/* Brand + project - LEFT SIDE (always on left) */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-4 md:gap-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5" id="tour-brand">
            <span className="relative flex h-2 w-2 shrink-0 sm:h-2.5 sm:w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00E5FF] sm:h-2.5 sm:w-2.5" />
            </span>
            <h1
              className="cursor-pointer truncate text-base font-semibold tracking-tight text-white sm:text-xl md:text-2xl"
              onClick={() => onTabChange('dashboard')}
            >
              Weekey
              <span className="bg-gradient-to-r from-[#00E5FF] to-[#2DD4BF] bg-clip-text font-semibold text-transparent">
                Osint
              </span>
            </h1>
          </div>
        </div>

        {/* Center space - empty, pushing actions to the right */}
        <div className="flex-1" id="tour-search"></div>

        {/* Actions - RIGHT SIDE (credits, notifications, profile) - ALWAYS on right side */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            id="tour-credits"
            type="button"
            onClick={onPricingClick}
            className="group flex items-center gap-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.03] px-2 py-1.5 transition-all hover:border-yellow-500/40 hover:bg-yellow-500/[0.06] hover:shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)] sm:gap-2.5 sm:px-3 sm:py-1.5"
            aria-label={`${credits} tokens remaining`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.2)] ring-1 ring-yellow-500/30 group-hover:scale-110 transition-transform sm:h-9 sm:w-9">
              <svg className="h-4 w-4 text-black sm:h-[22px] sm:w-[22px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
              </svg>
            </div>
            <span className="text-xs font-black tabular-nums text-yellow-500 sm:hidden">{credits}</span>
            <div className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-sm font-black tabular-nums text-yellow-500 tracking-tight">{credits}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500/50">Tokens</span>
            </div>
          </button>

          <div className="relative" ref={notificationsRef} id="tour-notifications">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-xl border border-white/[0.1] bg-white/[0.04] p-2 text-white/55 transition-colors hover:border-[#00E5FF]/25 hover:text-[#00E5FF] sm:p-3"
              aria-label="Notifications"
            >
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f87171] px-1 text-[10px] font-bold text-white shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 md:right-0 z-[10000] mt-4 w-[min(calc(100vw-1.5rem),24rem)] max-md:fixed max-md:top-16 max-md:left-3 max-md:right-3 max-md:w-auto max-md:mt-0 rounded-3xl border border-white/10 bg-[#000000] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:w-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-b border-white/[0.08] px-6 py-4 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Intelligence Feed</h3>
                  <span className="text-[9px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full uppercase">{unreadCount} New</span>
                </div>
                
                <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
                  {notifLoading ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Decrypting...</span>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em]">Nexus Clear</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredNotifications.map((notif) => (
                        <div key={notif.id} className="p-5 hover:bg-white/[0.02] transition-colors relative group">
                          {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E5FF]" />}
                          <div className="flex gap-4">
                            {getNotificationIcon(notif.type)}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-[13px] font-black text-white tracking-tight">{notif.title}</h4>
                                <span className="text-[9px] font-medium text-white/20 uppercase">{new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-[11px] text-white/40 leading-relaxed font-medium mb-3">{notif.message}</p>
                              
                              {notif.type === 'team_invite' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleInviteResponse(notif.id, 'accept')}
                                    className="px-4 py-1.5 bg-[#00E5FF] text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all active:scale-95"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleInviteResponse(notif.id, 'decline')}
                                    className="px-4 py-1.5 bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {filteredNotifications.length > 0 && (
                  <div className="border-t border-white/5 p-4 bg-white/[0.01] text-center">
                    <button 
                      onClick={handleClearAllNotifications}
                      className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                      Clear All Intelligence
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <UserMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Tab nav: mobile = floating curved bar; md+ = segmented pills */}
      <div
        id="tour-nav"
        className={[
          'max-md:fixed max-md:z-[9990]',
          'max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-max max-md:max-w-[min(calc(100vw-1.25rem),42rem)]',
          'max-md:bottom-[max(0.65rem,env(safe-area-inset-bottom,0.45rem))]',
          'max-md:rounded-[2rem] max-md:border max-md:border-white/[0.12]',
          'max-md:bg-[#000000] max-md:shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
          'max-md:px-1.5 max-md:py-1',
          'md:border-t md:border-white/[0.08] md:bg-[#000000] md:py-2.5',
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