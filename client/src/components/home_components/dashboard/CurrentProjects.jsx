import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CurrentModules = ({ 
  limit = 2, 
  onSelectModule, 
  selectedModuleId,
  scanData = []
}) => {
  const [showAll, setShowAll] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch scans from API
  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const moduleApis = [
        { id: 'job-recruitment', name: 'Job Recruitment', api: '/api/modules/job-recruitment', type: 'job' },
        { id: 'linkedin', name: 'LinkedIn Investigation', api: '/api/modules/linkedin-investigation', type: 'linkedin' },
        { id: 'social-media', name: 'Social Media OSINT', api: '/api/modules/social-media', type: 'social' },
        { id: 'scam-website', name: 'Scam Website Analysis', api: '/api/modules/scam-website', type: 'website' },
        { id: 'email-leak', name: 'Email Leak Check', api: '/api/modules/email-leak', type: 'email' },
        { id: 'scam-email', name: 'Scam Email Analysis', api: '/api/modules/scam-email', type: 'email-scam' },
        { id: 'phone-number', name: 'Phone Number OSINT', api: '/api/modules/phone-number', type: 'phone' },
        { id: 'crypto-wallet', name: 'Crypto Wallet Tracker', api: '/api/modules/crypto-wallet', type: 'crypto' }
      ];

      const allScansPromises = moduleApis.map(async (module) => {
        try {
          const response = await fetch(`${module.api}?_=${Date.now()}`);
          const data = await response.json();
          
          if (data.success && data.scans && data.scans.length > 0) {
            return data.scans.map(scan => ({
              id: `${module.id}_${scan.id}`,
              originalId: scan.id,
              name: module.name,
              type: module.type,
              target: getTargetDisplay(scan, module.id),
              status: scan.status,
              progress: scan.progress || 0,
              startTime: scan.started_at ? new Date(scan.started_at).toLocaleTimeString() : 'Just now',
              findings: scan.findings_count || 0,
              error: scan.error || null,
              assets: scan.assets || {}
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${module.name} scans:`, error);
          return [];
        }
      });

      const allScansArrays = await Promise.all(allScansPromises);
      const allScans = allScansArrays.flat();
      
      const sortedScans = allScans.sort((a, b) => {
        const statusOrder = { 'running': 0, 'queued': 1, 'paused': 2, 'pending': 3, 'completed': 4, 'stopped': 5, 'failed': 6 };
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.startTime) - new Date(a.startTime);
      });
      
      setModules(sortedScans);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTargetDisplay = (scan, moduleId) => {
    if (!scan.assets) return 'Scan';
    switch(moduleId) {
      case 'job-recruitment':
        return scan.assets?.job_title ? `${scan.assets.job_title} at ${scan.assets.company_name}` : 'Job Scan';
      case 'linkedin':
        return scan.assets?.profile_name || 'LinkedIn Profile';
      case 'social-media':
        return scan.assets?.display_name || 'Social Profile';
      case 'scam-website':
        return scan.assets?.website_name || 'Suspicious Website';
      case 'email-leak':
        return scan.assets?.email_address || 'Email Check';
      case 'scam-email':
        return scan.assets?.subject || 'Scam Email';
      case 'phone-number':
        return scan.assets?.phone_number || 'Phone Number';
      case 'crypto-wallet':
        return scan.assets?.wallet_address || 'Crypto Wallet';
      default:
        return 'Scan';
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchScans();
    const interval = setInterval(() => {
      fetchScans();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchScans]);

  // Calculate stats
  const moduleStats = useMemo(() => {
    const stats = { active: 0, completed: 0, pending: 0, failed: 0 };
    modules.forEach(module => {
      if (module.status === 'running' || module.status === 'queued') stats.active++;
      else if (module.status === 'completed') stats.completed++;
      else if (module.status === 'pending') stats.pending++;
      else if (module.status === 'failed') stats.failed++;
    });
    return stats;
  }, [modules]);

  // Displayed modules
  const displayedModules = useMemo(() => 
    showAll ? modules : modules.slice(0, limit),
    [modules, showAll, limit]
  );

  const getStatusStyles = useCallback((status) => {
    const styles = {
      running: { bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500', label: 'Running',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      queued: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500', label: 'Queued',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      pending: { bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500', label: 'Pending',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      paused: { bg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500', label: 'Paused',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      completed: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500', label: 'Completed',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
      failed: { bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', label: 'Failed',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> },
      stopped: { bg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20', text: 'text-gray-400', border: 'border-gray-500/30', dot: 'bg-gray-500', label: 'Stopped',
        icon: <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> }
    };
    return styles[status] || styles.pending;
  }, []);

  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  }, []);

  // Better icons for Active Modules header
  const HeaderIcon = () => (
    <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const ModuleIcon = useCallback(({ type }) => {
    const icons = {
      linkedin: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75M7.5 6v.75m0 3v.75m0 3v.75M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3zm3 6.75h6m-6 3h3" />
        </svg>
      ),
      crypto: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.57 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      website: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      phone: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      job: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
      ),
      social: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 5.25h4.5m-4.5 0a9 9 0 1118 0m-18 0a9 9 0 0118 0m-18 0v.75m18-0.75v.75M15 8.25h.008v.008H15V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      'email-scam': (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75" />
        </svg>
      )
    };
    return icons[type] || icons.job;
  }, []);

  const ModuleItem = useCallback(({ module, isSelected }) => {
    const statusStyle = getStatusStyles(module.status);
    const progressColor = getProgressColor(module.progress);
    
    return (
      <button
        onClick={() => onSelectModule?.(module)}
        className="relative w-full overflow-hidden rounded-xl focus:outline-none transition-all duration-300"
      >
        <div className={`bg-white/5 p-3 border-2 rounded-xl transition-all duration-300 ${
          isSelected ? 'border-purple-500' : 'border-transparent hover:border-purple-500/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${statusStyle.bg} flex items-center justify-center flex-shrink-0`}>
              <ModuleIcon type={module.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-white font-semibold text-sm truncate">{module.name}</h4>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} flex-shrink-0`}>
                  {statusStyle.icon}
                  <span className="hidden sm:inline">{statusStyle.label}</span>
                </span>
              </div>
              
              <p className={`text-xs font-medium truncate mt-0.5 ${statusStyle.text}`}>
                {module.target}
              </p>
              
              {module.status !== 'completed' && module.status !== 'failed' && module.status !== 'stopped' && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/40">Progress</span>
                    <span className="text-white font-medium">{module.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/40">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{module.startTime}</span>
                </div>
                {module.findings > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                    module.status === 'running' ? 'bg-green-500/20 text-green-400' :
                    module.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {module.findings} findings
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  }, [onSelectModule, getStatusStyles, getProgressColor, ModuleIcon]);

  const handleViewAll = useCallback(() => navigate('/home?tab=scan'), [navigate]);
  const handleStartScan = useCallback(() => navigate('/home?tab=scan'), [navigate]);
  const handleShowMore = useCallback(() => setShowAll(prev => !prev), []);

  if (loading && modules.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full">
        <div className="p-4 flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 mb-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          </div>
          <h4 className="text-white font-medium text-sm">Loading scans...</h4>
          <p className="text-white/40 text-xs mt-1">Fetching from database</p>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full">
        <div className="p-4 flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 mb-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h4 className="text-white font-medium text-sm mb-1">No active modules</h4>
          <p className="text-white/40 text-xs mb-3 text-center">No scans are currently running</p>
          <button onClick={handleStartScan} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full">
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <HeaderIcon />
              </div>
              {moduleStats.active > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-500" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Active Modules
                <span className="text-xs px-1.5 py-0.5 bg-white/5 rounded-full text-white/60">
                  {modules.length}
                </span>
              </h3>
              <p className="text-[10px] text-white/40">Real-time status</p>
            </div>
          </div>
          
          <div className="flex gap-1.5">
            <button onClick={fetchScans} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Refresh">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleViewAll} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="View All">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Row - Compact */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          <div className="bg-green-500/10 rounded-lg p-1.5 text-center border border-green-500/20">
            <div className="text-green-400 text-sm font-bold">{moduleStats.active}</div>
            <div className="text-white/40 text-[9px]">Active</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-1.5 text-center border border-yellow-500/20">
            <div className="text-yellow-400 text-sm font-bold">{moduleStats.pending}</div>
            <div className="text-white/40 text-[9px]">Pending</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-1.5 text-center border border-purple-500/20">
            <div className="text-purple-400 text-sm font-bold">{moduleStats.completed}</div>
            <div className="text-white/40 text-[9px]">Complete</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-1.5 text-center border border-red-500/20">
            <div className="text-red-400 text-sm font-bold">{moduleStats.failed}</div>
            <div className="text-white/40 text-[9px]">Failed</div>
          </div>
        </div>

        {/* Modules List - Smaller height, scroll after 2 boxes */}
        <div 
          className="space-y-2 overflow-y-auto pr-1"
          style={{
            maxHeight: modules.length > limit ? '280px' : 'auto',
            minHeight: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}
        >
          <style>{`
            div::-webkit-scrollbar { width: 4px; }
            div::-webkit-scrollbar-track { background: transparent; border-radius: 2px; }
            div::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 2px; }
            div::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
          `}</style>
          
          {displayedModules.map((module) => (
            <ModuleItem key={module.id} module={module} isSelected={selectedModuleId === module.id} />
          ))}
        </div>

        {/* Show More/Less button */}
        {modules.length > limit && (
          <button
            onClick={handleShowMore}
            className="w-full mt-2 py-1.5 px-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors flex items-center justify-center gap-1 border border-white/10"
          >
            <span>{showAll ? 'Show Less' : `Show ${modules.length - limit} More`}</span>
            <svg className={`w-3 h-3 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CurrentModules;