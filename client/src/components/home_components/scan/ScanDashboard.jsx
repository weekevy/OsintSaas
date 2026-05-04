import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ScanTabs from './ScanTabs';
import { InvestigationModules, CustomScanConfig } from './core/Modules';
import { RunningScans, ScanHistory, ScheduledScans } from './core/ScansManager';
import { getModuleAddModal, getModuleEditModal } from './modules';
import { getIcon } from './utils/icons';

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
    default:
      return 'SCAN';
  }
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const RunningScansSkeleton = () => (
  <div className="border border-white/10 rounded-2xl p-5 bg-[#0a0a0a] animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-11 h-11 bg-white/10 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-white/10 rounded w-40 mb-2" />
          <div className="h-3.5 bg-white/10 rounded w-56" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-white/10 rounded-lg" />
        <div className="w-9 h-9 bg-white/10 rounded-lg" />
        <div className="w-9 h-9 bg-white/10 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] py-10 px-8">
    <div className="flex items-center justify-center gap-6">
      <div className="w-14 h-14 border border-white/20 rounded-2xl flex items-center justify-center bg-white/5 flex-shrink-0">
        <svg className="w-7 h-7 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">No Active Scans</p>
        <p className="text-white/30 text-xs uppercase tracking-[0.1em] mt-1">Select a module below to begin</p>
      </div>
    </div>
  </div>
);

// ─── Main Header with Integrated Stats ─────────────────────────────────────────
const DashboardHeader = ({ filterLabel, selectedProject, onRefresh, isLoading, isRefreshing, stats, lastUpdated }) => (
  <header className="relative mb-8 rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />

    <div className="p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-1 h-4 bg-[#00E5FF] rounded-full" />
            <span className="text-[#00E5FF]/80 text-[10px] uppercase tracking-[0.22em] font-semibold">
              Scan Operations
            </span>
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-white leading-none">
            Scan Dashboard
          </h1>
          <p className="text-white/40 text-[13px] leading-relaxed mt-2">
            Monitoring{' '}
            <span className="text-[#00E5FF]/70 font-medium">{filterLabel}</span>
            {selectedProject && (
              <> · Project <span className="text-white/60">{selectedProject.name}</span></>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF]/30 text-white/50 hover:text-[#00E5FF] transition-all duration-200 text-[11px] uppercase tracking-[0.1em] disabled:opacity-35"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white/50 text-[11px] uppercase tracking-[0.1em]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integrated Stats Row - Centered and responsive */}
      
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

  // Real stats from actual data
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
      // Check cache first
      if (useCache && cachedModules && lastFetchTime && (Date.now() - lastFetchTime) < CACHE_DURATION) {
        console.log('Using cached module data');
        const all = cachedModules;
        
        setRunningScans(all.filter((s) => ['queued', 'running', 'paused'].includes(s.status)));
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
            const res = await fetch(`${module.api}?_=${Date.now()}`, { signal: controller.signal });
            const data = await res.json();
            if (!data.success || !data.scans?.length) return [];
            return data.scans.map((scan) => ({
              id: `${module.id}_${scan.id}`,
              originalId: scan.id,
              moduleId: module.id,
              moduleName: module.name,
              moduleIcon: module.icon,
              moduleColor: module.color,
              moduleTextColor: module.textColor,
              toolIcon: module.icon,
              target: getTargetDisplay(scan, module.id),
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

        setRunningScans(all.filter((s) => ['queued', 'running', 'paused'].includes(s.status)));
        setScanHistory(all.filter((s) => ['completed', 'stopped', 'failed', 'cancelled'].includes(s.status)));
        setLastUpdated(new Date());
        setInitialLoadDone(true);
        
        // Update cache
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

  // Initial load - no cache, force fresh
  useEffect(() => {
    fetchAllScans({ useCache: false });
    return () => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [fetchAllScans]);

  // On filter change, clear cache and refetch
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
        if (success) { handleCloseAdd(); debouncedRefresh(); }
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

  return (
    <div className="dashboard-ambient min-h-screen font-sans text-white">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10 pb-16">

        {/* ── INTEGRATED HEADER WITH STATS ── */}
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

        {/* ── RUNNING SCANS ── */}
        <section className="min-h-[160px] mt-6">
          {showSkeleton ? (
            <div className="space-y-3">
              <RunningScansSkeleton />
              <RunningScansSkeleton />
            </div>
          ) : showEmpty ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {annotatedRunningScans.map((scan) => (
                <div key={scan.id}>
                  <RunningScans
                    runningScans={[scan]}
                    onEditScan={handleEditScan}
                    onRemoveScan={handleRemoveScan}
                    onUpdateScanStatus={(scanId, newStatus) =>
                      setRunningScans((prev) =>
                        prev.map((s) => s.originalId === scanId ? { ...s, status: newStatus } : s)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── TAB PANELS ── */}
        <div className="mt-8">
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

        {/* ── HISTORY SECTION ONLY ── */}
        <section className="mt-10">
          <ScanHistory scanHistory={scanHistory} onRemoveScan={handleRemoveScan} />
        </section>
      </div>

      {renderAddModal()}
      {renderEditModal()}
    </div>
  );
};

export default ScanDashboard;