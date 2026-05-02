import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- GLOBAL CACHE (persists across component unmounts/remounts) ---
let globalModules = [];
let globalInitialLoadDone = false;
let isFetchingGlobal = false;

const CurrentModules = ({
  limit = 100,
  onSelectModule,
  selectedModuleId: externalSelectedModuleId,
  scanData = [],
  onRiskDataChange,
  refreshTrigger = 0
}) => {
  const [modules, setModules] = useState(globalModules);
  const [loading, setLoading] = useState(!globalInitialLoadDone);
  const [initialLoad, setInitialLoad] = useState(!globalInitialLoadDone);
  const [internalSelectedModuleId, setInternalSelectedModuleId] = useState(null);
  const [hoveredModuleId, setHoveredModuleId] = useState(null);
  const navigate = useNavigate();

  const selectedModuleId = externalSelectedModuleId !== undefined
    ? externalSelectedModuleId
    : internalSelectedModuleId;

  useEffect(() => {
    if (refreshTrigger > 0) forceRefresh();
  }, [refreshTrigger]);

  useEffect(() => {
    if (modules.length === 0 && !loading && globalInitialLoadDone) {
      if (onSelectModule) onSelectModule(null);
      if (onRiskDataChange) onRiskDataChange(null, '', '');
      setInternalSelectedModuleId(null);
    }
  }, [modules.length, loading, onSelectModule, onRiskDataChange]);

  const calculateRiskScore = (scan) => {
    let score = 0;
    if (scan.status === 'completed') score = Math.min(30, (scan.findings_count || 0) * 3);
    else if (scan.status === 'running' || scan.status === 'queued') score = 40 + (scan.findings_count || 0) * 2;
    else if (scan.status === 'pending') score = 60 + (scan.findings_count || 0) * 2;
    else if (scan.status === 'failed') score = 85;
    else score = 50;
    return Math.min(100, score);
  };

  const extractRiskData = useCallback((module) => {
    if (!module) return null;
    const randomRiskScore = Math.floor(Math.random() * 80) + 15;
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
    }
    const randomFactors = ['UNUSUAL DOMAIN AGE','SUSPICIOUS EMAIL PATTERN','MULTIPLE FAILED LOGINS','UNUSUAL LOCATION ACCESS','OUTDATED SSL CERTIFICATE','BLACKLISTED IP DETECTED','KNOWN SCAM PATTERN','SUSPICIOUS URL SHORTENER','UNVERIFIED REGISTRATION','RECENT DOMAIN REGISTRATION'];
    const numRandom = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numRandom; i++) {
      const f = randomFactors[Math.floor(Math.random() * randomFactors.length)];
      if (!riskFactors.includes(f)) riskFactors.push(f);
    }
    let riskLevel = 'low';
    if (randomRiskScore >= 75) riskLevel = 'critical';
    else if (randomRiskScore >= 50) riskLevel = 'high';
    else if (randomRiskScore >= 25) riskLevel = 'medium';
    return { risk_score: randomRiskScore, risk_level: riskLevel, risk_factors: riskFactors.slice(0, 5), recommendations: recommendations.slice(0, 3), scan_id: module.id, scan_name: module.name, target: module.target, status: module.status, findings: module.findings };
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
          const cb = forceRefresh ? `?_=${Date.now()}` : '';
          const response = await fetch(`${module.api}${cb}`);
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
            }));
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${module.name} scans:`, error);
          return [];
        }
      });
      const allScans = (await Promise.all(allScansPromises)).flat();
      const statusOrder = { running: 0, queued: 1, paused: 2, pending: 3, completed: 4, stopped: 5, failed: 6 };
      const sortedScans = allScans.sort((a, b) => {
        const diff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
        return diff !== 0 ? diff : new Date(b.startTime) - new Date(a.startTime);
      });
      globalModules = sortedScans;
      globalInitialLoadDone = true;
      setModules(sortedScans);
      setInitialLoad(false);
      if (sortedScans.length > 0 && !selectedModuleId && onSelectModule) {
        const first = sortedScans[0];
        setInternalSelectedModuleId(first.id);
        onSelectModule(first);
        if (onRiskDataChange) onRiskDataChange(extractRiskData(first), first.target, first.name);
      }
      if (sortedScans.length === 0) {
        setInternalSelectedModuleId(null);
        if (onSelectModule) onSelectModule(null);
        if (onRiskDataChange) onRiskDataChange(null, '', '');
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
      isFetchingGlobal = false;
    }
  }, [onSelectModule, selectedModuleId, onRiskDataChange, extractRiskData]);

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
      stopped:   { color: 'text-white/40', bg: 'bg-white/5', border: 'border-white/10', label: 'STOPPED' },
    };
    return configs[status] || configs.pending;
  }, []);

  const getTypeColor = useCallback((type) => {
    const map = {
      linkedin:    { color: 'text-[#60a5fa]', bg: 'bg-[#60a5fa]/10', border: 'border-[#60a5fa]/25' },
      job:         { color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/25' },
      social:      { color: 'text-[#c084fc]', bg: 'bg-[#c084fc]/10', border: 'border-[#c084fc]/25' },
      website:     { color: 'text-[#f97316]', bg: 'bg-[#f97316]/10', border: 'border-[#f97316]/25' },
      email:       { color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10', border: 'border-[#22d3ee]/25' },
      'email-scam':{ color: 'text-[#fb7185]', bg: 'bg-[#fb7185]/10', border: 'border-[#fb7185]/25' },
      phone:       { color: 'text-[#a3e635]', bg: 'bg-[#a3e635]/10', border: 'border-[#a3e635]/25' },
      crypto:      { color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/25' },
    };
    return map[type] || map.job;
  }, []);

  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return '#00E5FF';
    if (progress >= 50) return '#22d3ee';
    if (progress >= 25) return '#fbbf24';
    return '#f87171';
  }, []);

  const ModuleIcon = useCallback(({ type }) => {
    const tc = getTypeColor(type);
    const iconMap = {
      linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>,
      job: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>,
      social: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>,
      website: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
      email: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      'email-scam': <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      phone: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
      crypto: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    };
    return (
      <div className={`w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-lg ${tc.bg} border ${tc.border} flex items-center justify-center flex-shrink-0 ${tc.color} transition-colors md:transition-transform md:duration-200 md:group-hover:scale-105`}>
        {iconMap[type] || iconMap.job}
      </div>
    );
  }, [getTypeColor]);

  const StatusBadge = useCallback(({ status }) => {
    const cfg = getStatusConfig(status);
    const icons = {
      running:   <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current md:animate-pulse inline-block flex-shrink-0" />,
      queued:    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current inline-block flex-shrink-0" />,
      pending:   <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current inline-block flex-shrink-0" />,
      completed: <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current inline-block flex-shrink-0" />,
      failed:    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-[1px] bg-current inline-block flex-shrink-0" />,
      paused:    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current inline-block flex-shrink-0" />,
      stopped:   <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current inline-block flex-shrink-0" />,
    };
    return (
      <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-[2px] sm:py-[3px] rounded ${cfg.bg} ${cfg.color} border ${cfg.border} text-[6px] sm:text-[8px] font-bold tracking-widest whitespace-nowrap flex-shrink-0`}>
        {icons[status] || icons.pending}
        {cfg.label}
      </span>
    );
  }, [getStatusConfig]);

  const LoadingSkeleton = () => (
    <div className="glass-card rounded-xl overflow-hidden font-['Poppins'] w-full flex flex-col relative min-h-[400px] border border-white/10 shadow-xl">
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
    const cfg = getStatusConfig(module.status);
    const tc = getTypeColor(module.type);
    const showProgress = !['completed', 'failed', 'stopped'].includes(module.status);
    const isHovered = hoveredModuleId === module.id;

    const handleClick = () => {
      setInternalSelectedModuleId(module.id);
      if (onSelectModule) onSelectModule(module);
      if (onRiskDataChange) onRiskDataChange(extractRiskData(module), module.target, module.name);
    };

    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setHoveredModuleId(module.id)}
        onMouseLeave={() => setHoveredModuleId(null)}
        className={`group rounded-xl border cursor-pointer flex gap-2 sm:gap-3 items-start relative overflow-hidden p-2 sm:p-3 md:transition-colors md:duration-200 ${
          isSelected 
            ? 'border-[#00E5FF]/50 bg-gradient-to-br from-[#00E5FF]/15 via-[#00E5FF]/5 to-transparent md:shadow-[0_0_20px_rgba(0,229,255,0.08)]' 
            : isHovered ? 'border-white/20 bg-white/10' : 'border-white/5 bg-white/[0.02]'
        }`}
      >
        <ModuleIcon type={module.type} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <span className={`text-[11px] sm:text-sm font-bold tracking-wide truncate font-['Poppins'] ${isSelected ? 'text-[#00E5FF]' : 'text-white'}`}>
              {module.name}
            </span>
            <StatusBadge status={module.status} />
          </div>

          <p className={`text-[8px] sm:text-[11px] truncate mb-1 sm:mb-2 font-['Poppins'] ${isSelected ? tc.color : 'text-white/40'}`}>
            {module.target}
          </p>

          {showProgress && (
            <div className="mb-1 sm:mb-2">
              <div className="flex justify-between text-[7px] sm:text-[9px] text-white/40 tracking-widest mb-0.5 sm:mb-1 font-['Poppins']">
                <span>PROGRESS</span>
                <span className="font-bold" style={{ color: getProgressColor(module.progress) }}>{module.progress}%</span>
              </div>
              <div className="h-[2px] sm:h-[3px] bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full md:transition-[width] md:duration-300"
                  style={{ 
                    width: `${module.progress}%`,
                    backgroundColor: getProgressColor(module.progress)
                  }} 
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className="text-[7px] sm:text-[9px] text-white/30 flex items-center gap-0.5 sm:gap-1 font-['Poppins']">
              <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              {module.startTime}
            </span>
            {module.findings > 0 && (
              <span className={`px-1 sm:px-[7px] py-[1px] sm:py-[3px] rounded text-[7px] sm:text-[9px] tracking-wider font-bold font-['Poppins'] ${
                module.findings > 10 
                  ? 'bg-red-500/15 border border-red-500/30 text-red-400' 
                  : 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400'
              }`}>
                {module.findings} FINDINGS
              </span>
            )}
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 md:transition-opacity md:duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 md:translate-x-1'}`}>
          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }, [onSelectModule, onRiskDataChange, extractRiskData, getStatusConfig, getTypeColor, getProgressColor, ModuleIcon, StatusBadge, hoveredModuleId]);


  const handleViewAll = useCallback(() => navigate('/home?tab=scan'), [navigate]);

  if (initialLoad && loading) return <LoadingSkeleton />;

  const statCells = [
    { label: 'ACTIVE',   value: moduleStats.active,    color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10', border: 'border-[#00E5FF]/20' },
    { label: 'PENDING',  value: moduleStats.pending,   color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/20' },
    { label: 'COMPLETED',value: moduleStats.completed, color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10', border: 'border-[#22d3ee]/20' },
    { label: 'FAILED',   value: moduleStats.failed,    color: 'text-[#f87171]', bg: 'bg-[#f87171]/10', border: 'border-[#f87171]/20' },
  ];

  const hasActiveModules = modules.length > 0;

  return (
    <div className={`relative rounded-2xl font-['Poppins'] w-full transition-all duration-300 border border-white/[0.09] shadow-xl shadow-black/30 ring-1 ring-white/[0.04]`}     
         style={{ height: '385px', display: 'flex', flexDirection: 'column' }}> 
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e12]/95 via-[#080a0d] to-[#050608] pointer-events-none rounded-2xl max-md:backdrop-blur-none md:backdrop-blur-md" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/6 via-transparent to-transparent pointer-events-none rounded-2xl" />
      
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] rounded-2xl" 
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #00E5FF 1px, transparent 0)', backgroundSize: '30px 30px' }} />

      {/* Animated border glow */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#00E5FF]/20 via-[#2DD4BF]/20 to-[#00E5FF]/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col" style={{ height: '100%', overflow: 'hidden' }}>
        {/* Header - Fixed */}
        <div className="p-2 sm:p-[14px_16px_12px] border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-white/[0.01]">
          <div className="flex items-center gap-2 sm:gap-[11px]">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 text-[#00E5FF]">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-[11px] sm:text-sm font-bold text-white tracking-wide uppercase font-['Poppins']">ACTIVE PROJECTS</h3>
              <p className="text-[7px] sm:text-[9px] text-white/30 tracking-widest uppercase mt-0.5 font-['Poppins']">REAL-TIME MONITOR</p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-1.5 items-center">
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-[4px_10px] rounded bg-[#00E5FF]/15 border border-[#00E5FF]/30 mr-0.5 sm:mr-1">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#00E5FF] md:animate-pulse" />
              <span className="text-[6px] sm:text-[7px] text-[#00E5FF] tracking-[0.12em] font-bold font-['Poppins']">LIVE</span>
            </div>
            <button onClick={forceRefresh} disabled={loading} className="w-6 h-6 sm:w-[30px] sm:h-[30px] border border-white/15 rounded-lg bg-white/5 text-white/40 flex items-center justify-center transition-all hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loading ? 'animate-spin' : ''}`}>
                <path d="M4 4v5h5M20 20v-5h-5M4.55 9A8 8 0 0 1 20 12M19.45 15A8 8 0 0 1 4 12"/>
              </svg>
            </button>
            <button onClick={handleViewAll} className="w-6 h-6 sm:w-[30px] sm:h-[30px] border border-white/15 rounded-lg bg-white/5 text-white/40 flex items-center justify-center transition-all hover:border-[#00E5FF]/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 sm:w-3.5 sm:h-3.5">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Grid - Fixed with responsive text */}
        <div className="grid grid-cols-4 p-2 sm:p-[10px_14px] gap-1 sm:gap-[7px] border-b border-white/10 flex-shrink-0 bg-white/[0.005]">
          {statCells.map(s => (
            <div key={s.label} className={`rounded-lg p-1 sm:p-[8px_6px] text-center ${s.bg} border ${s.border} md:transition-transform md:hover:scale-[1.02]`}>
              <div className={`text-base sm:text-2xl font-bold ${s.color} leading-none tabular-nums font-['Poppins']`}>{s.value}</div>
              <div className="text-[6px] sm:text-[8px] text-white/40 tracking-wider mt-0.5 sm:mt-1 font-bold font-['Poppins']">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scrollable Projects List */}
        <div className="flex-1 p-1 sm:p-2 overflow-y-auto scrollbar-custom" style={{ minHeight: 0 }}>
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {modules.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center p-4 sm:p-8 gap-2 sm:gap-3" style={{ minHeight: '200px' }}>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white/20">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  </svg>
                </div>
                <p className="text-[9px] sm:text-[11px] font-bold text-white/40 tracking-wider uppercase font-['Poppins']">NO ACTIVE PROJECTS</p>
                <p className="text-[7px] sm:text-[9px] text-white/20 tracking-wider uppercase font-['Poppins']">START A SCAN TO BEGIN</p>
              </div>
            ) : (
              modules.slice(0, limit).map(m => (
                <ModuleItem key={m.id} module={m} isSelected={selectedModuleId === m.id} />
              ))
            )}
            {loading && !initialLoad && (
              <div className="flex justify-center p-2 sm:p-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 3px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.3);
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CurrentModules;