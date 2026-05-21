import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- GLOBAL CACHE (persists across component unmounts/remounts) ---
let globalModules = [];
let globalInitialLoadDone = false;
let isFetchingGlobal = false;

const STORAGE_KEY = 'currentModules_selectedId';

const CurrentModules = ({
  limit = 100,
  onSelectModule,
  selectedModuleId: externalSelectedModuleId,
  selectedProjectId,
  scanData = [],
  onRiskDataChange,
  refreshTrigger = 0
}) => {
  const [modules, setModules] = useState(globalModules);
  const [loading, setLoading] = useState(!globalInitialLoadDone);
  const [initialLoad, setInitialLoad] = useState(!globalInitialLoadDone);
  const [internalSelectedModuleId, setInternalSelectedModuleId] = useState(
    () => {
      try { return localStorage.getItem(STORAGE_KEY) || null; } catch { return null; }
    }
  );
  const [hoveredModuleId, setHoveredModuleId] = useState(null);
  const navigate = useNavigate();

  // ── FIX: keep a ref that always reflects the latest selected ID ──
  // This prevents stale closures in the polling interval from resetting
  // the selection back to whichever module was selected on mount.
  const selectedIdRef = useRef(
    externalSelectedModuleId !== undefined
      ? externalSelectedModuleId
      : (() => { try { return localStorage.getItem(STORAGE_KEY) || null; } catch { return null; } })()
  );

  const selectedModuleId = externalSelectedModuleId !== undefined
    ? externalSelectedModuleId
    : internalSelectedModuleId;

  // Keep the ref in sync whenever either source changes
  useEffect(() => {
    selectedIdRef.current = selectedModuleId;
  }, [selectedModuleId]);

  // Helper: persist + set selected ID
  const persistSelection = useCallback((id) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    setInternalSelectedModuleId(id);
    selectedIdRef.current = id; // keep ref in sync immediately
  }, []);

  // Poll for real-time updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (globalInitialLoadDone) fetchScans(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) forceRefresh();
  }, [refreshTrigger]);

  useEffect(() => {
    if (modules.length === 0 && !loading && globalInitialLoadDone) {
      if (onSelectModule) onSelectModule(null);
      if (onRiskDataChange) onRiskDataChange(null, '', '');
      persistSelection(null);
    }
  }, [modules.length, loading, onSelectModule, onRiskDataChange, persistSelection]);

  const calculateRiskScore = (scan) => {
    // Priority 1: Use actual risk score from backend if available
    if (scan.assets && scan.assets.risk_score !== undefined && scan.assets.risk_score > 0) {
      return scan.assets.risk_score;
    }
    
    // Priority 2: Use level-based mapping if score is 0 but level is set
    if (scan.assets && scan.assets.risk_level) {
      const levelMap = { low: 15, medium: 45, high: 70, critical: 85 };
      return levelMap[scan.assets.risk_level] || 15;
    }

    // Fallback: heuristic calculation based on findings
    let score = 0;
    if (scan.status === 'completed') score = Math.min(30, (scan.findings_count || 0) * 3);
    else if (scan.status === 'running' || scan.status === 'queued') score = 40 + (scan.findings_count || 0) * 2;
    else if (scan.status === 'pending') score = 60 + (scan.findings_count || 0) * 2;
    else if (scan.status === 'failed') score = 85;
    else score = 0;
    return Math.min(100, score);
  };

  const extractRiskData = useCallback((module) => {
    if (!module) return null;
    
    // Use the riskScore already calculated in fetchScans (which now uses actual data)
    const riskScore = module.riskScore || 0;
    
    const riskFactors = [];
    const recommendations = [];
    if (module.status === 'failed') { riskFactors.push('SCAN FAILED TO COMPLETE'); recommendations.push('Check scan configuration and try again'); }
    if (module.findings > 10) { riskFactors.push(`HIGH FINDINGS COUNT (${module.findings})`); recommendations.push('Review findings for critical issues'); }
    if (module.progress < 50 && module.status === 'running') riskFactors.push('SLOW SCAN PROGRESS');
    if (module.status === 'pending') { riskFactors.push('SCAN QUEUED'); recommendations.push('Monitor scan status'); }
    
    if (module.assets) {
      if (module.assets.recruiter_email?.includes('gmail.com')) { riskFactors.push('PERSONAL EMAIL DOMAIN USED'); recommendations.push('Verify recruiter identity through official channels'); }
      if (module.assets.company_website && !module.assets.company_website.startsWith('https')) riskFactors.push('MISSING SSL CERTIFICATE');
      if (module.assets.risk_score > 50) riskFactors.push(`HIGH RISK SCORE (${module.assets.risk_score})`);
      if (module.assets.red_flags_noticed) {
        try {
          const flags = typeof module.assets.red_flags_noticed === 'string' 
            ? JSON.parse(module.assets.red_flags_noticed) 
            : module.assets.red_flags_noticed;
          if (Array.isArray(flags)) riskFactors.push(...flags);
        } catch (e) {}
      }
    }
    
    let riskLevel = 'low';
    if (riskScore >= 75) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'medium';
    
    return { 
      risk_score: riskScore, 
      risk_level: riskLevel, 
      risk_factors: riskFactors.slice(0, 5), 
      recommendations: recommendations.slice(0, 3), 
      scan_id: module.id, 
      scan_name: module.name, 
      target: module.target, 
      status: module.status, 
      findings: module.findings 
    };
  }, []);

  const getTargetDisplay = (scan, moduleId) => {
    if (!scan.assets) return 'SCAN';
    switch (moduleId) {
      case 'company-jobscam': return scan.assets?.job_title ? `${scan.assets.job_title} at ${scan.assets.company_name}` : 'JOB SCAN';
      case 'linkedin': return scan.assets?.profile_name || 'LINKEDIN PROFILE';
      case 'social-media': return scan.assets?.display_name || 'SOCIAL PROFILE';
      case 'scam-website': return scan.assets?.website_name || 'SUSPICIOUS WEBSITE';
      case 'email-leak': return scan.assets?.email_address || 'EMAIL CHECK';
      case 'scam-email': return scan.assets?.subject || 'SCAM EMAIL';
      case 'phone-number': return scan.assets?.phone_number || 'PHONE NUMBER';
      case 'crypto-wallet': return scan.assets?.wallet_address || 'CRYPTO WALLET';
      default: return 'SCAN';
    }
  };

  const fetchScans = useCallback(async (forceRefresh = false) => {
    if (isFetchingGlobal && !forceRefresh) return;
    isFetchingGlobal = true;
    setLoading(true);
    try {
      const moduleApis = [
        { id: 'company-jobscam', name: 'Company & Job Scam', api: '/api/modules/company-jobscam', type: 'job' },
        { id: 'linkedin', name: 'LinkedIn Investigation', api: '/api/modules/linkedin-investigation', type: 'linkedin' },
        { id: 'social-media', name: 'Social Media OSINT', api: '/api/modules/social-media', type: 'social' },
        { id: 'scam-website', name: 'Scam Website Analysis', api: '/api/modules/scam-website', type: 'website' },
        { id: 'email-leak', name: 'Email Leak Check', api: '/api/modules/email-leak', type: 'email' },
        { id: 'scam-email', name: 'Scam Email Analysis', api: '/api/modules/scam-email', type: 'email-scam' },
        { id: 'phone-number', name: 'Phone Number OSINT', api: '/api/modules/phone-number', type: 'phone' },
        { id: 'crypto-wallet', name: 'Crypto Wallet Tracker', api: '/api/modules/crypto-wallet', type: 'crypto' },
      ];

      const allScansPromises = moduleApis.map(async (module) => {
        try {
          const params = new URLSearchParams();
          if (forceRefresh) params.append('_', Date.now().toString());
          if (selectedProjectId) params.append('projectId', selectedProjectId);
          
          const response = await fetch(`${module.api}${params.toString() ? '?' + params.toString() : ''}`);
          const data = await response.json();
          if (data.success && data.scans?.length > 0) {
            return data.scans.map(scan => ({
              id: `${module.id}_${scan.id}`,
              originalId: scan.id,
              name: module.name,
              type: module.type,
              target: getTargetDisplay(scan, module.id),
              status: scan.status,
              progress: scan.progress || 0,
              startTime: scan.started_at ? new Date(scan.started_at).toLocaleTimeString() : 'JUST NOW',
              findings: scan.findings_count || 0,
              error: scan.error || null,
              assets: scan.assets || {},
              riskScore: calculateRiskScore(scan),
              createdAt: scan.created_at || new Date().toISOString(),
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${module.name} scans:`, error);
          return [];
        }
      });

      const allScans = (await Promise.all(allScansPromises)).flat();

      // Sort for display: active first, then by status priority
      const statusOrder = { running: 0, queued: 1, paused: 2, pending: 3, completed: 4, stopped: 5, failed: 6 };
      const sortedScans = [...allScans].sort((a, b) => {
        const diff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
        return diff !== 0 ? diff : new Date(b.createdAt) - new Date(a.createdAt);
      });

      globalModules = sortedScans;
      globalInitialLoadDone = true;
      setModules(sortedScans);
      setInitialLoad(false);

      // ── LIVE STATUS SYNC & RE-SELECTION LOGIC ──
      const currentlySelectedId = selectedIdRef.current;

      if (currentlySelectedId) {
        const liveModule = sortedScans.find(m => m.id === currentlySelectedId);
        
        if (liveModule) {
          // Module still exists, sync latest state
          if (onSelectModule) onSelectModule(liveModule);
          
          // PROPAGATE FULL DATA: This ensures the RiskScore is calculated and 
          // persisted in RiskCircle's internal state across refreshes.
          if (onRiskDataChange) {
            onRiskDataChange(
              extractRiskData(liveModule),
              liveModule.target,
              liveModule.name
            );
          }
        } else if (sortedScans.length > 0) {
          // ── AUTO-RESELECT: Current selection was deleted ──
          const nextProject = sortedScans[0];
          persistSelection(nextProject.id);
          if (onSelectModule) onSelectModule(nextProject);
          if (onRiskDataChange) onRiskDataChange(extractRiskData(nextProject), nextProject.target, nextProject.name);
        } else {
          // ── NO PROJECTS LEFT ──
          persistSelection(null);
          if (onSelectModule) onSelectModule(null);
          if (onRiskDataChange) onRiskDataChange(null, '', '');
        }
      } else if (sortedScans.length > 0) {
        // ── INITIAL AUTO-SELECT (only if nothing is selected) ──
        const firstProject = sortedScans[0];
        persistSelection(firstProject.id);
        if (onSelectModule) onSelectModule(firstProject);
        if (onRiskDataChange) onRiskDataChange(extractRiskData(firstProject), firstProject.target, firstProject.name);
      } else {
        // No projects at all
        persistSelection(null);
        if (onSelectModule) onSelectModule(null);
        if (onRiskDataChange) onRiskDataChange(null, '', '');
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
      isFetchingGlobal = false;
    }
  }, [onSelectModule, onRiskDataChange, extractRiskData, persistSelection, selectedProjectId]);
  // ── NOTE: removed internalSelectedModuleId and externalSelectedModuleId from
  // the dep array — we read from selectedIdRef instead to avoid stale closures.

  const forceRefresh = useCallback(async () => { await fetchScans(true); }, [fetchScans]);

  useEffect(() => { if (!globalInitialLoadDone) fetchScans(true); }, []);

  const moduleStats = useMemo(() => {
    const stats = { active: 0, completed: 0, pending: 0, failed: 0 };
    modules.forEach(m => {
      if (m.status === 'running' || m.status === 'queued') stats.active++;
      else if (m.status === 'completed') stats.completed++;
      else if (m.status === 'pending') stats.pending++;
      else if (m.status === 'failed') stats.failed++;
    });
    return stats;
  }, [modules]);

  const getStatusConfig = useCallback((status) => {
    const configs = {
      running:   { color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/30', label: 'ACTIVE' },
      queued:    { color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10', border: 'border-[#a78bfa]/30', label: 'QUEUED' },
      pending:   { color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/30', label: 'PENDING' },
      paused:    { color: 'text-[#fb923c]', bg: 'bg-[#fb923c]/10', border: 'border-[#fb923c]/30', label: 'PAUSED' },
      completed: { color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10', border: 'border-[#22d3ee]/30', label: 'COMPLETE' },
      failed:    { color: 'text-[#f87171]', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/30', label: 'FAILED' },
      stopped:   { color: 'text-white/40',  bg: 'bg-white/5',       border: 'border-white/10',      label: 'STOPPED' },
    };
    return configs[status] || configs.pending;
  }, []);

  const getTypeColor = useCallback((type) => {
    const map = {
      linkedin:     { color: 'text-[#60a5fa]', bg: 'bg-[#60a5fa]/10', border: 'border-[#60a5fa]/25' },
      job:          { color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/25' },
      social:       { color: 'text-[#c084fc]', bg: 'bg-[#c084fc]/10', border: 'border-[#c084fc]/25' },
      website:      { color: 'text-[#f97316]', bg: 'bg-[#f97316]/10', border: 'border-[#f97316]/25' },
      email:        { color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10', border: 'border-[#22d3ee]/25' },
      'email-scam': { color: 'text-[#fb7185]', bg: 'bg-[#fb7185]/10', border: 'border-[#fb7185]/25' },
      phone:        { color: 'text-[#a3e635]', bg: 'bg-[#a3e635]/10', border: 'border-[#a3e635]/25' },
      crypto:       { color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/25' },
    };
    return map[type] || map.job;
  }, []);

  const ModuleIcon = useCallback(({ type }) => {
    const tc = getTypeColor(type);
    const iconMap = {
      linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>,
      job: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>,
      social: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>,
      website: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
      email: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      'email-scam': <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      phone: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
      crypto: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    };
    return (
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${tc.bg} border ${tc.border} flex items-center justify-center flex-shrink-0 ${tc.color} md:transition-transform md:duration-200 md:group-hover:scale-105`}>
        {iconMap[type] || iconMap.job}
      </div>
    );
  }, [getTypeColor]);

  const StatusBadge = useCallback(({ status }) => {
    const cfg = getStatusConfig(status);
    const dot = (
      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current inline-block flex-shrink-0 ${status === 'running' ? 'md:animate-pulse' : ''}`} />
    );
    return (
      <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border} text-[8px] sm:text-[10px] font-bold tracking-widest whitespace-nowrap flex-shrink-0`}>
        {dot}
        {cfg.label}
      </span>
    );
  }, [getStatusConfig]);

  const LoadingSkeleton = () => (
    <div className="glass-card rounded-xl overflow-hidden font-sans w-full flex flex-col relative min-h-[400px] border border-white/10 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-transparent pointer-events-none" />
      <div className="p-[14px_16px_12px] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/5 border border-[#00E5FF]/20 animate-pulse" />
          <div>
            <div className="w-[120px] h-3 rounded bg-white/10 animate-pulse mb-1.5" />
            <div className="w-[70px] h-2 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="p-[10px_14px] grid grid-cols-4 gap-[7px] min-h-[74px]">
        {[1,2,3,4].map(i => <div key={i} className="h-[52px] rounded-md bg-white/10 animate-pulse" />)}
      </div>
      <div className="p-[8px_10px] flex flex-col gap-1.5">
        {[1,2,3].map(i => <div key={i} className="h-[72px] rounded-lg bg-white/10 border border-white/5 animate-pulse" />)}
      </div>
    </div>
  );

  const ModuleItem = useCallback(({ module, isSelected }) => {
    const statusCfg = getStatusConfig(module.status);
    const tc = getTypeColor(module.type);
    const isHovered = hoveredModuleId === module.id;

    const handleClick = () => {
      persistSelection(module.id);
      if (onSelectModule) onSelectModule(module);
      if (onRiskDataChange) onRiskDataChange(extractRiskData(module), module.target, module.name);
    };

    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setHoveredModuleId(module.id)}
        onMouseLeave={() => setHoveredModuleId(null)}
        className={`group rounded-xl border cursor-pointer flex gap-3 sm:gap-4 items-start relative overflow-hidden p-3 sm:p-4 md:transition-colors md:duration-200 ${
          isSelected
            ? 'border-[#00E5FF]/50 bg-gradient-to-br from-[#00E5FF]/15 via-[#00E5FF]/5 to-transparent'
            : isHovered ? 'border-white/20 bg-white/10' : 'border-white/5 bg-white/[0.02]'
        }`}
      >
        <ModuleIcon type={module.type} />

        <div className="flex-1 min-w-0">
          {/* Name + badge row */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${
                module.status === 'running'   ? 'bg-[#00E5FF] animate-pulse' :
                module.status === 'paused'    ? 'bg-[#fb923c]' :
                module.status === 'completed' ? 'bg-[#22d3ee]' :
                module.status === 'failed'    ? 'bg-[#f87171]' :
                module.status === 'pending'   ? 'bg-[#fbbf24]' :
                'bg-white/30'
              }`} />
              <span className={`text-sm sm:text-base font-bold tracking-wide truncate font-sans ${isSelected ? 'text-[#00E5FF]' : 'text-white'}`}>
                {module.name}
              </span>
            </div>
            <StatusBadge status={module.status} />
          </div>

          {/* Target */}
          <p className={`text-[10px] sm:text-xs truncate mb-2 sm:mb-3 font-sans ${isSelected ? tc.color : 'text-white/40'}`}>
            {module.target}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[8px] sm:text-[10px] text-white/30 flex items-center gap-1 sm:gap-1.5 font-sans">
              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              {module.startTime}
            </span>
            {module.findings > 0 && (
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] tracking-wider font-bold font-sans ${
                module.findings > 10
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                  : 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400'
              }`}>
                {module.findings} FINDINGS
              </span>
            )}
            {module.assets && Object.keys(module.assets).length > 0 && (
              <span className="text-[8px] sm:text-[10px] text-white/30 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                {Object.keys(module.assets).length} assets
              </span>
            )}
          </div>
        </div>

        {/* Selection chevron */}
        <div className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 md:transition-opacity md:duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }, [onSelectModule, onRiskDataChange, extractRiskData, getStatusConfig, getTypeColor, ModuleIcon, StatusBadge, hoveredModuleId, persistSelection]);

  const handleViewAll = useCallback(() => navigate('/home?tab=scan'), [navigate]);

  if (initialLoad && loading) return <LoadingSkeleton />;

  const statCells = [
    { label: 'ACTIVE',    value: moduleStats.active,    color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/20' },
    { label: 'PENDING',   value: moduleStats.pending,   color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/20' },
    { label: 'COMPLETED', value: moduleStats.completed, color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10', border: 'border-[#22d3ee]/20' },
    { label: 'FAILED',    value: moduleStats.failed,    color: 'text-[#f87171]', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/20' },
  ];

  return (
    <div
      id="tour-project-list"
      className="relative rounded-2xl font-sans w-full border border-white/[0.09] shadow-xl shadow-black/30 ring-1 ring-white/[0.04]"
      style={{ height: '408px', display: 'flex', flexDirection: 'column' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e12]/95 via-[#080a0d] to-[#050608] pointer-events-none rounded-2xl max-md:backdrop-blur-none md:backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/6 via-transparent to-transparent pointer-events-none rounded-2xl" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] rounded-2xl"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)', backgroundSize: '30px 30px' }}
      />

      <div className="relative z-10 flex flex-col h-full">

        {/* ── Header (fixed) ── */}
        <div className="p-3 sm:p-[14px_16px_12px] border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-2 sm:gap-[11px]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#00E5FF]">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase font-sans">ACTIVE PROJECTS</h3>
              <p className="text-[8px] sm:text-[9px] text-white/30 tracking-widest uppercase mt-0.5 font-sans">REAL-TIME MONITOR</p>
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-[4px_10px] rounded bg-[#00E5FF]/15 border border-[#00E5FF]/30 mr-0.5 sm:mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] md:animate-pulse" />
              <span className="text-[7px] sm:text-[8px] text-[#00E5FF] tracking-[0.12em] font-bold font-sans">LIVE</span>
            </div>
            <button
              onClick={forceRefresh}
              disabled={loading}
              className="w-8 h-8 sm:w-10 sm:h-10 border border-white/15 rounded-lg bg-white/5 text-white/40 flex items-center justify-center hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`}
              >
                <path d="M4 4v5h5M20 20v-5h-5M4.55 9A8 8 0 0 1 20 12M19.45 15A8 8 0 0 1 4 12"/>
              </svg>
            </button>
            <button
              onClick={handleViewAll}
              className="w-8 h-8 sm:w-10 sm:h-10 border border-white/15 rounded-lg bg-white/5 text-white/40 flex items-center justify-center hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Stats grid (fixed) ── */}
        <div className="grid grid-cols-4 p-2 sm:p-[10px_14px] gap-1 sm:gap-[7px] border-b border-white/10 flex-shrink-0 bg-white/[0.005]">
          {statCells.map(s => (
            <div key={s.label} className={`rounded-lg p-1.5 sm:p-[8px_6px] text-center ${s.bg} border ${s.border}`}>
              <div className={`text-lg sm:text-2xl font-bold ${s.color} leading-none tabular-nums font-sans`}>{s.value}</div>
              <div className="text-[7px] sm:text-[8px] text-white/40 tracking-wider mt-0.5 sm:mt-1 font-bold font-sans">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Scrollable module list (takes remaining space) ── */}
        <div className="flex-1 p-2 sm:p-3 overflow-y-auto scrollbar-custom" style={{ minHeight: 0 }}>
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {modules.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 gap-3 sm:gap-4" style={{ minHeight: '200px' }}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white/20">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  </svg>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-white/40 tracking-wider uppercase font-sans">NO ACTIVE PROJECTS</p>
                <p className="text-[8px] sm:text-[10px] text-white/20 tracking-wider uppercase font-sans">START A SCAN TO BEGIN</p>
              </div>
            ) : (
              modules.slice(0, limit).map(m => (
                <ModuleItem key={m.id} module={m} isSelected={selectedModuleId === m.id} />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-custom::-webkit-scrollbar { width: 4px; }
        .scrollbar-custom::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .scrollbar-custom::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.4); border-radius: 4px; }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.6); }
      `}</style>
    </div>
  );
};

export default CurrentModules;