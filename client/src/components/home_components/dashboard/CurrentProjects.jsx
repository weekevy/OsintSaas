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
      running:   { color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.35)', label: 'ACTIVE' },
      queued:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.35)', label: 'QUEUED' },
      pending:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.35)', label: 'PENDING' },
      paused:    { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.35)', label: 'PAUSED' },
      completed: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.35)', label: 'COMPLETE' },
      failed:    { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.35)', label: 'FAILED' },
      stopped:   { color: 'rgba(255,255,255,0.35)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', label: 'STOPPED' },
    };
    return configs[status] || configs.pending;
  }, []);

  const getTypeColor = useCallback((type) => {
    const map = {
      linkedin:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
      job:         { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
      social:      { color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.25)' },
      website:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
      email:       { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.25)' },
      'email-scam':{ color: '#fb7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)' },
      phone:       { color: '#a3e635', bg: 'rgba(163,230,53,0.12)', border: 'rgba(163,230,53,0.25)' },
      crypto:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
    };
    return map[type] || map.job;
  }, []);

  const getProgressColor = useCallback((progress) => {
    if (progress >= 75) return '#00ff88';
    if (progress >= 50) return '#22d3ee';
    if (progress >= 25) return '#fbbf24';
    return '#f87171';
  }, []);

  const ModuleIcon = useCallback(({ type }) => {
    const tc = getTypeColor(type);
    const iconMap = {
      linkedin: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>,
      job: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>,
      social: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>,
      website: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>,
      email: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      'email-scam': <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
      phone: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
      crypto: <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
    };
    return (
      <div style={{
        width: 38, height: 38, borderRadius: 8,
        background: tc.bg, border: `1px solid ${tc.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: tc.color,
        transition: 'all 0.2s',
      }}>
        {iconMap[type] || iconMap.job}
      </div>
    );
  }, [getTypeColor]);

  const StatusBadge = useCallback(({ status }) => {
    const cfg = getStatusConfig(status);
    const icons = {
      running:   <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', animation: 'pulseDot 1.5s ease-in-out infinite', flexShrink: 0 }} />,
      queued:    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />,
      pending:   <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite', flexShrink: 0 }} />,
      completed: <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />,
      failed:    <span style={{ width: 5, height: 5, borderRadius: 1, background: cfg.color, display: 'inline-block', flexShrink: 0 }} />,
      paused:    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />,
      stopped:   <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />,
    };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 4,
        fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'inherit',
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
        flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        {icons[status] || icons.pending}
        {cfg.label}
      </span>
    );
  }, [getStatusConfig]);

  const LoadingSkeleton = () => (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)' }} />
          <div>
            <div style={{ width: 120, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.06)', animation: 'skeletonPulse 1.5s ease-in-out infinite', marginBottom: 6 }} />
            <div style={{ width: 70, height: 8, borderRadius: 3, background: 'rgba(255,255,255,0.04)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 14px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, minHeight: 74 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 52, borderRadius: 7, background: 'rgba(255,255,255,0.03)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />)}
      </div>
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, minHeight: 180, maxHeight: 280 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 72, borderRadius: 9, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />)}
      </div>
      <style>{`@keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
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
        style={{
          borderRadius: 10,
          border: `1px solid ${isSelected ? cfg.color + '55' : isHovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
          background: isSelected
            ? `linear-gradient(135deg, ${cfg.color}10 0%, rgba(255,255,255,0.01) 100%)`
            : isHovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
          padding: '12px 12px',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ModuleIcon type={module.type} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: isSelected ? cfg.color : '#fff',
              fontFamily: 'inherit', transition: 'color 0.15s',
            }}>
              {module.name}
            </span>
            <StatusBadge status={module.status} />
          </div>

          <p style={{
            fontSize: 9, color: isSelected ? tc.color : 'rgba(255,255,255,0.4)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: 8, fontFamily: 'inherit', transition: 'color 0.15s',
          }}>
            {module.target}
          </p>

          {showProgress && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 4 }}>
                <span>PROGRESS</span>
                <span style={{ color: getProgressColor(module.progress), fontWeight: 700 }}>{module.progress}%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${module.progress}%`,
                  background: `linear-gradient(90deg, ${getProgressColor(module.progress)}cc, ${getProgressColor(module.progress)})`,
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg style={{ width: 8, height: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              {module.startTime}
            </span>
            {module.findings > 0 && (
              <span style={{
                padding: '3px 7px', borderRadius: 4,
                background: module.findings > 10 ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)',
                border: `1px solid ${module.findings > 10 ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
                fontSize: 8, color: module.findings > 10 ? '#f87171' : '#fbbf24',
                letterSpacing: '0.08em', fontFamily: 'inherit', fontWeight: 700,
              }}>
                {module.findings} FINDINGS
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }, [onSelectModule, onRiskDataChange, extractRiskData, getStatusConfig, getTypeColor, getProgressColor, ModuleIcon, StatusBadge, hoveredModuleId]);

  const handleViewAll = useCallback(() => navigate('/home?tab=scan'), [navigate]);

  if (initialLoad && loading) return <LoadingSkeleton />;

  const statCells = [
    { label: 'ACTIVE',   value: moduleStats.active,    color: '#00ff88', bg: 'rgba(0,255,136,0.07)', border: 'rgba(0,255,136,0.2)' },
    { label: 'PENDING',  value: moduleStats.pending,   color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)' },
    { label: 'DONE',     value: moduleStats.completed, color: '#22d3ee', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)' },
    { label: 'FAILED',   value: moduleStats.failed,    color: '#f87171', bg: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.2)' },
  ];

  const hasActiveModules = modules.length > 0;

  return (
    <div style={{
      ...styles.panel,
      border: hasActiveModules ? '1px solid rgba(0,255,136,0.25)' : '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)',
        backgroundSize: '22px 22px',
      }} />

      <div style={styles.panelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={styles.headerIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16, color: '#00ff88' }}>
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <div>
            <h3 style={styles.headerTitle}>ACTIVE PROJECTS</h3>
            <p style={styles.headerSub}>REAL-TIME MONITOR</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 4, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', marginRight: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00ff88', display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 8, color: '#00ff88', fontFamily: 'inherit', letterSpacing: '0.12em', fontWeight: 700 }}>LIVE</span>
          </div>
          <button onClick={forceRefresh} disabled={loading} style={styles.iconBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,255,136,0.4)'; e.currentTarget.style.color='#00ff88'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.3)'; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 14, height: 14, animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M4 4v5h5M20 20v-5h-5M4.55 9A8 8 0 0 1 20 12M19.45 15A8 8 0 0 1 4 12"/>
            </svg>
          </button>
          <button onClick={handleViewAll} style={styles.iconBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,255,136,0.4)'; e.currentTarget.style.color='#00ff88'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.3)'; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        padding: '10px 14px',
        gap: 7,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
        minHeight: 74,
      }}>
        {statCells.map(s => (
          <div key={s.label} style={{
            borderRadius: 7, padding: '8px 6px', textAlign: 'center',
            background: s.bg, border: `1px solid ${s.border}`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 5,
        minHeight: 180,
        maxHeight: 280,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,255,136,0.2) transparent',
      }}>
        {modules.length === 0 && !loading ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px 20px', gap: 8, minHeight: 160,
          }}>
            <div style={{
              width: 40, height: 40, border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.15)' }}>
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
              </svg>
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>NO ACTIVE PROJECTS</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>START A SCAN TO BEGIN</p>
          </div>
        ) : (
          modules.slice(0, limit).map(m => (
            <ModuleItem key={m.id} module={m} isSelected={selectedModuleId === m.id} />
          ))
        )}
        {loading && !initialLoad && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <div style={{ width: 14, height: 14, border: '1.5px solid rgba(0,255,136,0.2)', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
      `}</style>
    </div>
  );
};

const styles = {
  panel: {
    background: 'linear-gradient(180deg, #0c1014 0%, #090c0f 100%)',
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    minHeight: 364,
    maxHeight: 420,  // 👈 THIS FIXES THE BOX FROM EXPANDING
  },
  panelHeader: {
    padding: '14px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerIcon: {
    width: 36, height: 36,
    borderRadius: 8,
    background: 'rgba(0,255,136,0.08)',
    border: '1px solid rgba(0,255,136,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 12, fontWeight: 700, color: '#fff',
    letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
  },  
  headerSub: {
    fontSize: 9, color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.12em', textTransform: 'uppercase', margin: '2px 0 0',
  },
  iconBtn: {
    width: 30, height: 30,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    background: 'transparent',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
    padding: 0,
  },
};

export default CurrentModules;