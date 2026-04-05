import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// --- GLOBAL CACHE (persists across component unmounts/remounts) ---
let globalModules = [];
let globalInitialLoadDone = false;
let isFetchingGlobal = false;

const CurrentModules = ({ 
  limit = 100, 
  onSelectModule, 
  selectedModuleId: externalSelectedModuleId,
  scanData = []
}) => {
  const [modules, setModules] = useState(globalModules);
  const [loading, setLoading] = useState(!globalInitialLoadDone);
  const [initialLoad, setInitialLoad] = useState(!globalInitialLoadDone);
  const [internalSelectedModuleId, setInternalSelectedModuleId] = useState(null);
  const navigate = useNavigate();

  const selectedModuleId = externalSelectedModuleId !== undefined 
    ? externalSelectedModuleId 
    : internalSelectedModuleId;

  const calculateRiskScore = (scan, moduleId) => {
    let score = 0;
    if (scan.status === 'completed') {
      score = Math.min(30, (scan.findings_count || 0) * 3);
    } 
    else if (scan.status === 'running' || scan.status === 'queued') {
      score = 40 + (scan.findings_count || 0) * 2;
    }
    else if (scan.status === 'pending') {
      score = 60 + (scan.findings_count || 0) * 2;
    }
    else if (scan.status === 'failed') {
      score = 85;
    }
    else {
      score = 50;
    }
    return Math.min(100, score);
  };

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

  const fetchScans = useCallback(async (forceRefresh = false) => {
    if (isFetchingGlobal && !forceRefresh) return;
    
    isFetchingGlobal = true;
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
          const cacheBuster = forceRefresh ? `?_=${Date.now()}` : '';
          const response = await fetch(`${module.api}${cacheBuster}`);
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
              assets: scan.assets || {},
              riskScore: calculateRiskScore(scan, module.id)
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
      
      globalModules = sortedScans;
      globalInitialLoadDone = true;
      
      setModules(sortedScans);
      setInitialLoad(false);
      
      if (sortedScans.length > 0 && !selectedModuleId && onSelectModule) {
        const firstModule = sortedScans[0];
        setInternalSelectedModuleId(firstModule.id);
        onSelectModule(firstModule);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
      isFetchingGlobal = false;
    }
  }, [onSelectModule, selectedModuleId]);

  const forceRefresh = useCallback(async () => {
    await fetchScans(true);
  }, [fetchScans]);

  useEffect(() => {
    if (!globalInitialLoadDone) {
      fetchScans(true);
    }
  }, []);

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

  const getStatusStyles = useCallback((status) => {
    const styles = {
      running: { bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Running',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      queued: { bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Queued',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      pending: { bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Pending',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      paused: { bg: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Paused',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
      completed: { bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Completed',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> },
      failed: { bg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Failed',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> },
      stopped: { bg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Stopped',
        icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> }
    };
    return styles[status] || styles.pending;
  }, []);

  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-cyan-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-purple-500 to-pink-500';
  }, []);

  const LoadingSkeleton = () => (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full" style={{ height: '380px' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 animate-pulse"></div>
            <div>
              <div className="h-6 w-36 bg-white/10 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-44 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 animate-pulse"></div>
            <div className="w-9 h-9 rounded-lg bg-white/10 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-2.5 text-center border border-white/10 animate-pulse">
              <div className="h-7 w-10 mx-auto bg-white/10 rounded mb-1"></div>
              <div className="h-3 w-12 mx-auto bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10"></div>
              <div className="flex-1">
                <div className="h-5 w-36 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-52 bg-white/10 rounded mb-2"></div>
                <div className="h-2.5 w-28 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HeaderIcon = () => (
    <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
  );

  const ModuleIcon = useCallback(({ type }) => {
    const icons = {
      linkedin: <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/></svg>,
      crypto: <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
      email: <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      website: <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
      phone: <svg className="w-6 h-6 text-teal-400" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
      job: <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c4.2 0 8 3.22 8 8.2 0 3.32-2.67 7.25-8 11.8-5.33-4.55-8-8.48-8-11.8C4 5.22 7.8 2 12 2z"/></svg>,
      social: <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>,
      'email-scam': <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
    };
    return icons[type] || icons.job;
  }, []);

  const ModuleItem = useCallback(({ module, isSelected }) => {
    const statusStyle = getStatusStyles(module.status);
    const progressColor = getProgressColor(module.progress);
    
    return (
      <div
        onClick={() => {
          setInternalSelectedModuleId(module.id);
          if (onSelectModule) onSelectModule(module);
        }}
        className="relative w-full overflow-hidden rounded-xl focus:outline-none transition-all duration-300 cursor-pointer group"
      >
        <div className={`bg-white/5 p-3 rounded-xl transition-all duration-300 border ${
          isSelected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-purple-500/50'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusStyle.bg} flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}>
              <ModuleIcon type={module.type} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className={`font-semibold text-base truncate transition-colors duration-300 ${isSelected ? 'text-purple-400' : 'text-white'}`}>
                  {module.name}
                </h4>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} flex-shrink-0`}>
                  {statusStyle.icon}
                  <span>{statusStyle.label}</span>
                </span>
              </div>
              
              <p className={`text-sm font-medium truncate mb-2 ${isSelected ? statusStyle.text : 'text-white/70'}`}>
                {module.target}
              </p>
              
              {module.status !== 'completed' && module.status !== 'failed' && module.status !== 'stopped' && (
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Progress</span>
                    <span className="text-white font-medium">{module.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${module.progress}%` }} />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{module.startTime}</span>
                </div>
                {module.findings > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
      </div>
    );
  }, [onSelectModule, getStatusStyles, getProgressColor, ModuleIcon]);

  const handleViewAll = useCallback(() => navigate('/home?tab=scan'), [navigate]);

  if (initialLoad && loading) {
    return <LoadingSkeleton />;
  }

  // Fixed height container for both empty and populated states
  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden w-full" style={{ height: '380px' }}>
      <div className="p-4 h-full flex flex-col">
        {/* Header - BIGGER */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <HeaderIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Active Projects</h3>
              <p className="text-xs text-white/40">Real-time status from database</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={forceRefresh} disabled={loading} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors disabled:opacity-50" title="Refresh">
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleViewAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="View All">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Row - BIGGER */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-green-500/10 rounded-lg p-2.5 text-center border border-green-500/20">
            <div className="text-green-400 text-lg font-bold">{moduleStats.active}</div>
            <div className="text-white/40 text-xs">Active</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2.5 text-center border border-yellow-500/20">
            <div className="text-yellow-400 text-lg font-bold">{moduleStats.pending}</div>
            <div className="text-white/40 text-xs">Pending</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-2.5 text-center border border-purple-500/20">
            <div className="text-purple-400 text-lg font-bold">{moduleStats.completed}</div>
            <div className="text-white/40 text-xs">Complete</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2.5 text-center border border-red-500/20">
            <div className="text-red-400 text-lg font-bold">{moduleStats.failed}</div>
            <div className="text-white/40 text-xs">Failed</div>
          </div>
        </div>

        {/* Projects List - Fixed height with scrollbar */}
        <div 
          className="flex-1 space-y-2 overflow-y-auto"
          style={{
            minHeight: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent'
          }}
        >
          <style>{`
            .space-y-2::-webkit-scrollbar { width: 4px; }
            .space-y-2::-webkit-scrollbar-track { background: transparent; border-radius: 2px; }
            .space-y-2::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
            .space-y-2::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
          `}</style>
          
          {modules.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/>
                </svg>
              </div>
              <h4 className="text-white font-semibold text-base mb-1">No Active Projects</h4>
              <p className="text-white/40 text-xs text-center">No scans are currently running</p>
            </div>
          ) : (
            modules.map((module) => (
              <ModuleItem key={module.id} module={module} isSelected={selectedModuleId === module.id} />
            ))
          )}
          
          {loading && !initialLoad && (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentModules;