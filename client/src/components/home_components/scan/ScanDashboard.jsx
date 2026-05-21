import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ScanTabs from './ScanTabs';
import { InvestigationModules, CustomScanConfig } from './core/Modules';
import { RunningScans, ScanHistory, ScheduledScans } from './core/ScansManager';
import { getModuleAddModal, getModuleEditModal } from './modules';
import { getIcon } from './utils/icons';
import api from '../../../services/api';

// Cache for modules data to prevent re-fetching on tab switches
let cachedModules = null;
let lastFetchTime = null;
const CACHE_DURATION = 30000; // 30 seconds cache

// ─── Module Definitions ───────────────────────────────────────────────────────
const ALL_MODULES = [
  {
    id: 'job-recruitment',
    name: 'Company & Job Scam',
    api: '/api/modules/company-jobscam',
    icon: 'job',
    color: 'from-[#00E5FF] to-[#2DD4BF]',
    textColor: 'text-[#00E5FF]',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Investigation',
    api: '/api/modules/linkedin-investigation',
    icon: 'linkedin',
    color: 'from-[#2DD4BF] to-[#00E5FF]',
    textColor: 'text-[#2DD4BF]',
  },
  {
    id: 'social-media',
    name: 'Social Media OSINT',
    api: '/api/modules/social-media',
    icon: 'social',
    color: 'from-[#FF0088] to-[#FF00CC]',
    textColor: 'text-[#FF0088]',
  },
  {
    id: 'scam-website',
    name: 'Scam Website Analysis',
    api: '/api/modules/scam-website',
    icon: 'globe',
    color: 'from-[#FF8800] to-[#FFBB00]',
    textColor: 'text-[#FF8800]',
  },
  {
    id: 'crypto-wallet',
    name: 'Crypto Wallet Scanner',
    api: '/api/modules/crypto-wallet',
    icon: 'wallet',
    color: 'from-[#8800FF] to-[#CC00FF]',
    textColor: 'text-[#8800FF]',
  },
];

const getModuleById = (moduleId) =>
  ALL_MODULES.find((m) => m.id === moduleId) || ALL_MODULES[0];

const getTargetDisplay = (scan, moduleId) => {
  if (!scan.assets) return 'SCAN';
  switch (moduleId) {
    case 'job-recruitment':
      if (scan.assets?.company_name && scan.assets?.job_title)
        return `${scan.assets.job_title} at ${scan.assets.company_name}`;
      if (scan.assets?.company_name) return scan.assets.company_name;
      if (scan.assets?.recruiter_name) return `Recruiter: ${scan.assets.recruiter_name}`;
      return 'JOB SCAM CHECK';
    case 'linkedin':
      return scan.assets?.profile_name || 'LINKEDIN PROFILE';
    case 'social-media':
      return scan.assets?.display_name || scan.assets?.twitter_url || scan.assets?.facebook_url || 'SOCIAL PROFILE';
    default:
      return 'SCAN';
  }
};

// ─── Skeleton Loader — exact same height as a real scan card ─────────────────
// The card renders: p-3 sm:p-5 with icon(36/48px) + text + buttons row = ~88px mobile / ~96px desktop
// We match that precisely so there is zero layout shift when data arrives.
const RunningScansSkeleton = () => (
  <div
    className="relative border border-white/10 rounded-xl sm:rounded-2xl bg-black overflow-hidden"
    style={{ minHeight: 88 }}
  >
    {/* inner glow to match real card feel */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] to-transparent pointer-events-none" />
    <div className="p-3 sm:p-5 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: icon + text */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white/10 rounded-lg sm:rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
              <div className="h-3 sm:h-4 bg-white/10 rounded w-32 sm:w-40" />
              <div className="h-5 sm:h-6 bg-white/10 rounded w-16 sm:w-20" />
            </div>
            <div className="h-2.5 sm:h-3 bg-white/[0.07] rounded w-44 sm:w-56" />
          </div>
        </div>
        {/* Right: buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-6 sm:h-8 w-14 sm:w-20 bg-white/10 rounded-lg" />
          <div className="h-6 sm:h-8 w-10 sm:w-14 bg-white/10 rounded-lg" />
          <div className="h-6 sm:h-8 w-14 sm:w-18 bg-white/[0.07] rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div
    className="relative rounded-xl sm:rounded-2xl border border-white/10 bg-black overflow-hidden"
    style={{ minHeight: 88 }}
  >
    {/* Subtle inner atmospheric glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.04] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />
    {/* Corner brackets */}
    <span className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-[#00E5FF]/20" />
    <span className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-[#00E5FF]/20" />

    <div className="relative flex items-center gap-4 sm:gap-6 px-5 sm:px-8 py-5 sm:py-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 border border-white/15 rounded-xl flex items-center justify-center bg-white/[0.03] flex-shrink-0">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] sm:text-[12px] font-bold text-white/50 uppercase tracking-[0.16em]">No Active Scans</p>
        <p className="text-white/25 text-[9px] sm:text-[10px] uppercase tracking-[0.1em] mt-0.5">Select a module below to begin</p>
      </div>
    </div>
  </div>
);

// ─── Main Header ──────────────────────────────────────────────────────────────
const DashboardHeader = ({ filterLabel, selectedProject, onRefresh, isLoading, isRefreshing, stats, lastUpdated }) => (
  <header className="relative mb-6 sm:mb-8 rounded-xl sm:rounded-2xl border border-white/10 bg-black overflow-hidden">
    {/* Top edge glow */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />
    {/* Inner atmospheric glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/[0.03] via-transparent to-[#2DD4BF]/[0.02] pointer-events-none" />

    <div className="relative p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-1 h-3.5 sm:h-4 bg-[#00E5FF] rounded-full" />
            <span className="text-[#00E5FF]/80 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold">
              Scan Operations
            </span>
          </div>
          <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold tracking-tight text-white leading-tight">
            Scan Dashboard
          </h1>
          <p className="text-white/40 text-[11px] sm:text-[13px] leading-relaxed mt-1.5 sm:mt-2">
            Monitoring{' '}
            <span className="text-[#00E5FF]/70 font-medium">{filterLabel}</span>
            {selectedProject && (
              <> · Project <span className="text-white/60">{selectedProject.name}</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-white/10 rounded-lg sm:rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white/50 hover:text-[#00E5FF] transition-all duration-200 text-[10px] sm:text-[11px] uppercase tracking-[0.1em] disabled:opacity-35"
          >
            <svg className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-white/10 rounded-lg sm:rounded-xl bg-white/5 text-white/50 text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ScanDashboard = ({
  searchInput,
  onSearchChange,
  onAnalyze,
  isAnalyzing,
  selectedProject,
}) => {
  const [activeScanTab, setActiveScanTab] = useState('module');
  const [scanOptions, setScanOptions] = useState({
    deepScan: false,
    passiveMode: true,
    activeMode: false,
    stealthMode: false,
    followRedirects: true,
  });

  const [runningScans, setRunningScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [newScanIds, setNewScanIds] = useState(new Set());
  const prevScanIdsRef = useRef(new Set());

  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddAssets, setShowAddAssets] = useState(false);
  const [showEditAssets, setShowEditAssets] = useState(false);
  const [editingScan, setEditingScan] = useState(null);

  const [filterModule, setFilterModule] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const fetchAbortRef = useRef(null);
  const isSavingRef = useRef(false);
  const isEditOpenRef = useRef(false);
  const isAddOpenRef = useRef(false);
  const refreshTimeoutRef = useRef(null);

  const stats = useMemo(() => {
    const all = [...runningScans, ...scanHistory];
    return {
      total: all.length,
      activeNow: runningScans.filter((s) => ['queued', 'running'].includes(s.status)).length,
      findings: scanHistory.reduce((acc, s) => acc + (s.findings || 0), 0),
    };
  }, [runningScans, scanHistory]);

  const fetchAllScans = useCallback(
    async ({ silent = false, useCache = true } = {}) => {
      if (useCache && cachedModules && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        const all = cachedModules;
        setRunningScans(all.filter((s) => ['queued', 'pending', 'running', 'paused', 'failed', 'completed'].includes(s.status)));
        setScanHistory(all.filter((s) => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)));
        if (!silent) setStatus('idle');
        setInitialLoadDone(true);
        setLastUpdated(new Date());
        return;
      }

      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      if (!silent) setStatus('loading');

      try {
        const modulesToFetch =
          filterModule === 'all' ? ALL_MODULES : ALL_MODULES.filter((m) => m.id === filterModule);
        const results = await Promise.allSettled(
          modulesToFetch.map(async (module) => {
            let url = `${module.api}?_=${Date.now()}`;
            if (selectedProject?.id) {
              url += `&projectId=${selectedProject.id}`;
            }
            const response = await api.get(url, { signal: controller.signal });
            const data = response.data;
            if (!data.success || !data.scans?.length) return [];
            return data.scans.map((scan) => ({
              id: `${module.id}_${scan.id}`,
              originalId: scan.id,
              jobRecruitmentId: scan.originalId,
              moduleId: module.id,
              moduleName: module.name,
              moduleIcon: module.icon,
              moduleColor: module.color,
              moduleTextColor: module.textColor,
              toolIcon: module.icon,
              target: getTargetDisplay(scan, module.id),
              rawTarget: scan.target?.value || scan.assets?.job_url || scan.assets?.company_website || 'Unknown',
              api: module.api,
              status: scan.status,
              progress: scan.progress || 0,
              assets: scan.assets,
              findings: scan.findings_count || 0,
              createdAt: scan.created_at,
            }));
          })
        );

        if (controller.signal.aborted) return;

        const seen = new Set();
        const all = results
          .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
          .filter((scan) => {
            const key = `${scan.moduleId}_${scan.originalId}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const allNextIds = new Set(all.map((s) => s.id));
        const brandNew = new Set([...allNextIds].filter((id) => !prevScanIdsRef.current.has(id)));
        if (brandNew.size > 0 && prevScanIdsRef.current.size > 0) {
          setNewScanIds(brandNew);
          setTimeout(() => setNewScanIds(new Set()), 700);
        }
        prevScanIdsRef.current = allNextIds;

        setRunningScans(all.filter((s) => ['queued', 'pending', 'running', 'paused', 'failed', 'completed'].includes(s.status)));
        setScanHistory(all.filter((s) => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)));
        setLastUpdated(new Date());
        setInitialLoadDone(true);

        cachedModules = all;
        lastFetchTime = Date.now();
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Fetch error:', err);
      } finally {
        if (!controller.signal.aborted) setStatus('idle');
      }
    },
    [filterModule]
  );

  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => fetchAllScans({ silent: true, useCache: false }), 500);
  }, [fetchAllScans]);

  useEffect(() => {
    fetchAllScans({ useCache: false });
    return () => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [fetchAllScans]);

  // ── Auto-refresh when scans are active ──
  useEffect(() => {
    const hasActiveScans = runningScans.some(s => ['queued', 'running', 'paused'].includes(s.status));
    let intervalId = null;

    if (hasActiveScans) {
      intervalId = setInterval(() => {
        fetchAllScans({ silent: true, useCache: false });
      }, 3000); // 3 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [runningScans, fetchAllScans]);

  useEffect(() => {
    cachedModules = null;
    lastFetchTime = null;
    fetchAllScans({ useCache: false });
  }, [filterModule]);

  useEffect(() => {
    const handler = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target))
        setShowFilterDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStartScan = useCallback((module) => {
    if (isAddOpenRef.current) return;
    isAddOpenRef.current = true;
    setSelectedModule(module);
    setShowAddAssets(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setShowAddAssets(false);
    setSelectedModule(null);
    setTimeout(() => { isAddOpenRef.current = false; }, 100);
  }, []);

  const handleSaveAssets = useCallback(
    async (assetData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      const module = getModuleById(assetData.moduleType);
      const apiBase = module?.api || '/api/modules/company-jobscam';
      try {
        let success = false;
        if (assetData.files?.length) {
          const fd = new FormData();
          fd.append('project_id', selectedProject?.id || '');
          Object.entries(assetData.assets).forEach(([k, v]) => v && fd.append(k, v));
          assetData.files.forEach((file, i) => fd.append(`evidence_${i}`, file));
          const res = await fetch(apiBase, { method: 'POST', body: fd });
          const data = await res.json();
          success = data.success;
        } else {
          const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...assetData.assets, project_id: selectedProject?.id }),
          });
          const data = await res.json();
          success = data.success;
        }
        if (success) { 
          handleCloseAdd(); 
          fetchAllScans({ silent: true, useCache: false }); 
        }
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        isSavingRef.current = false;
      }
    },
    [selectedProject, debouncedRefresh, handleCloseAdd]
  );

  const handleRemoveScan = useCallback(
    async (scanId, moduleId) => {
      const module = getModuleById(moduleId);
      const apiBase = module?.api || '/api/modules/company-jobscam';
      setRunningScans((p) => p.filter((s) => s.originalId !== scanId));
      setScanHistory((p) => p.filter((s) => s.originalId !== scanId));
      try {
        const res = await fetch(`${apiBase}?id=${scanId}`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) debouncedRefresh();
      } catch (err) {
        console.error('Remove error:', err);
        debouncedRefresh();
      }
    },
    [debouncedRefresh]
  );

  const handleEditScan = useCallback((scan) => {
    if (isEditOpenRef.current) return;
    isEditOpenRef.current = true;
    setEditingScan({ id: scan.originalId, toolId: scan.moduleId, tool: scan.moduleName, assets: scan.assets, status: scan.status });
    setShowEditAssets(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditAssets(false);
    setEditingScan(null);
    setTimeout(() => { isEditOpenRef.current = false; }, 100);
  }, []);

  const handleUpdateAssets = useCallback(
    async (scanId, updatedAssets) => {
      if (!editingScan) return;
      const module = getModuleById(editingScan.toolId);
      const apiBase = module?.api || '/api/modules/job-recruitment';
      try {
        const res = await fetch(`${apiBase}?id=${scanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedAssets),
        });
        const data = await res.json();
        if (data.success) { handleCloseEdit(); debouncedRefresh(); }
      } catch (err) {
        console.error('Update error:', err);
      }
    },
    [editingScan, debouncedRefresh, handleCloseEdit]
  );

  const renderAddModal = () => {
    if (!showAddAssets || !selectedModule) return null;
    const Modal = getModuleAddModal(selectedModule.id);
    if (!Modal) return null;
    return (
      <Modal
        isOpen={showAddAssets}
        onClose={handleCloseAdd}
        moduleType={selectedModule.id}
        moduleName={selectedModule.name}
        onSave={handleSaveAssets}
        projectId={selectedProject?.id}
      />
    );
  };

  const renderEditModal = () => {
    if (!showEditAssets || !editingScan) return null;
    const Modal = getModuleEditModal(editingScan.toolId);
    if (!Modal) return null;
    return (
      <Modal
        isOpen={showEditAssets}
        onClose={handleCloseEdit}
        scan={editingScan}
        onUpdate={handleUpdateAssets}
      />
    );
  };

  const filterLabel =
    filterModule === 'all' ? 'All Modules' : getModuleById(filterModule).name;
  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const annotatedRunningScans = useMemo(
    () => runningScans.map((s) => ({ ...s, _isNew: newScanIds.has(s.id) })),
    [runningScans, newScanIds]
  );

  const showSkeleton = isLoading && !initialLoadDone;
  const showEmpty = !isLoading && !showSkeleton && annotatedRunningScans.length === 0;

  // How many skeleton rows to show = same as last known count (or 2 on first load)
  const skeletonCount = annotatedRunningScans.length > 0 ? annotatedRunningScans.length : 2;

  return (
    <div className="dashboard-ambient min-h-screen font-sans text-white">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8 md:py-10 pb-16">

        {/* ── HEADER ── */}
        <DashboardHeader
          filterLabel={filterLabel}
          selectedProject={selectedProject}
          onRefresh={() => fetchAllScans({ silent: true, useCache: false })}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          stats={stats}
          lastUpdated={lastUpdated}
        />

        {/* ── TABS ── */}
        <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

        {/* ── RUNNING SCANS SECTION ────────────────────────────────────────────
            We always reserve the "Active Scans" header + content area so the
            page height never jumps between skeleton → real data.
        ──────────────────────────────────────────────────────────────────────── */}
        <section className="mt-5 sm:mt-6">
          {/* Single "Active Scans" header — always visible, not per-scan */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-[#2DD4BF] to-[#00E5FF] rounded-full" />
            <h3 className="text-white text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.14em]">
              Current Scans
              {!showSkeleton && (
                <span className="ml-1.5 text-[#2DD4BF]/70 text-[10px] sm:text-[11px]">
                  ({annotatedRunningScans.length})
                </span>
              )}
            </h3>
          </div>

          {/* Content area — fixed structure regardless of state */}
          <div className={`space-y-2 sm:space-y-3 transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${initialLoadDone ? 'opacity-100' : 'opacity-90'}`}>
            {showSkeleton ? (
              <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-300">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <RunningScansSkeleton key={i} />
                ))}
              </div>
            ) : showEmpty ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <EmptyState />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <RunningScans
                  runningScans={annotatedRunningScans}
                  onEditScan={handleEditScan}
                  onRemoveScan={handleRemoveScan}
                  onRefresh={() => fetchAllScans({ silent: true, useCache: false })}
                  onUpdateScanStatus={(scanId, newStatus) =>
                    setRunningScans((prev) =>
                      prev.map((s) => s.originalId === scanId ? { ...s, status: newStatus } : s)
                    )
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* ── TAB PANELS ── */}
        <div className="mt-6 sm:mt-8">
          {activeScanTab === 'module' && (
            <InvestigationModules
              onStartScan={handleStartScan}
              selectedTarget={selectedProject?.name || searchInput}
            />
          )}
          {activeScanTab === 'custom' && (
            <CustomScanConfig
              scanOptions={scanOptions}
              toggleOption={(opt) => setScanOptions((p) => ({ ...p, [opt]: !p[opt] }))}
              selectedProjectForScan={selectedProject}
              searchInput={searchInput}
              onStartCustomScan={() => console.log('custom scan', scanOptions)}
              isLoading={isLoading}
            />
          )}
          {activeScanTab === 'scheduled' && (
            <ScheduledScans scanHistory={scanHistory} runningScans={runningScans} />
          )}
        </div>

        {/* ── HISTORY SECTION ── */}
        <section className="mt-8 sm:mt-10">
          <ScanHistory scanHistory={scanHistory} onRemoveScan={handleRemoveScan} />
        </section>
      </div>

      {renderAddModal()}
      {renderEditModal()}
    </div>
  );
};

export default ScanDashboard;