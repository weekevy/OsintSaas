import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ScanTabs from './ScanTabs';
import { InvestigationModules, CustomScanConfig } from './core/Modules';
import { RunningScans, ScanHistory, ScheduledScans } from './core/ScansManager';
import { getModuleAddModal, getModuleEditModal } from './modules';
import { getIcon } from './utils/icons';

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

// ─── Skeleton Loader for Running Scans ───────────────────────────────────────
const RunningScansSkeleton = () => (
  <div className="border border-white/10 rounded-2xl p-4 bg-[#0a0a0a] animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-white/10 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-32 mb-2" />
          <div className="h-3 bg-white/10 rounded w-48" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
        <div className="w-8 h-8 bg-white/10 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="rounded-2xl p-8 flex items-center justify-center border border-white/10 bg-white/[0.02] min-h-[140px]">
    <div className="flex items-center gap-5">
      <div className="w-14 h-14 border border-white/[0.08] rounded-xl flex items-center justify-center flex-shrink-0 bg-[#00E5FF]/5">
        <svg className="w-7 h-7 text-[#00E5FF]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="font-['Poppins'] text-sm font-bold text-white/60 uppercase tracking-widest">No Active Scans</p>
        <p className="text-white/30 text-xs font-['Poppins'] uppercase tracking-[0.1em] mt-1">Select a module below to begin</p>
      </div>
    </div>
  </div>
);

const StatBadge = ({ label, value, accent }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 border border-white/[0.08] rounded-xl flex items-center justify-center flex-shrink-0 bg-[#0a0a0a]">
      <svg className="w-5 h-5" style={{ color: accent }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <div>
      <div className="text-white/35 text-[11px] font-['Poppins'] uppercase tracking-[0.15em]">{label}</div>
      <div className="text-3xl font-bold font-['Poppins'] leading-tight text-white">{value}</div>
    </div>
  </div>
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
    };
  }, [runningScans, scanHistory]);

  const fetchAllScans = useCallback(
    async ({ silent = false } = {}) => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;
      if (!silent) setStatus('loading');

      try {
        const modulesToFetch = filterModule === 'all' ? ALL_MODULES : ALL_MODULES.filter((m) => m.id === filterModule);
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
    refreshTimeoutRef.current = setTimeout(() => fetchAllScans({ silent: true }), 500);
  }, [fetchAllScans]);

  useEffect(() => {
    fetchAllScans();
    return () => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [fetchAllScans]);

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

  const handleSaveAssets = useCallback(async (assetData) => {
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
        debouncedRefresh();
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [selectedProject, debouncedRefresh, handleCloseAdd]);

  const handleRemoveScan = useCallback(async (scanId, moduleId) => {
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
  }, [debouncedRefresh]);

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

  const handleUpdateAssets = useCallback(async (scanId, updatedAssets) => {
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
      if (data.success) {
        handleCloseEdit();
        debouncedRefresh();
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  }, [editingScan, debouncedRefresh, handleCloseEdit]);

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

  const filterLabel = filterModule === 'all' ? 'All Modules' : getModuleById(filterModule).name;
  const isLoading = status === 'loading';
  const isRefreshing = status === 'refreshing';
  const annotatedRunningScans = useMemo(() => runningScans.map((s) => ({ ...s, _isNew: newScanIds.has(s.id) })), [runningScans, newScanIds]);
  
  const showSkeleton = isLoading && !initialLoadDone;
  const showEmpty = !isLoading && !showSkeleton && annotatedRunningScans.length === 0;

  return (
    <div className="dashboard-ambient min-h-screen font-sans text-white">
      <div className="relative z-[1] max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10 pb-14 md:pb-12">
        
        {/* HEADER - Like DashboardHome */}
        <header className="mb-8 md:mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E5FF]/85 uppercase mb-2">
            Scan Operations
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[2rem] font-semibold tracking-tight text-white">
            Scan Dashboard
          </h1>
          <p className="mt-2 text-sm md:text-[15px] text-white/50 leading-relaxed">
            Filter: <span className="text-[#00E5FF]/80">{filterLabel}</span>
          </p>
        </header>

        {/* Refresh & Filter Row */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button
            onClick={() => fetchAllScans({ silent: true })}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-200 text-xs font-['Poppins'] uppercase tracking-[0.1em] disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline text-xs">Refresh</span>
          </button>

          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown((v) => !v)}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/[0.08] rounded-xl bg-white/5 hover:bg-[#00E5FF]/10 text-white/60 hover:text-[#00E5FF] transition-colors duration-200 text-xs font-['Poppins'] uppercase tracking-[0.1em]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline text-xs">Filter</span>
              <svg className={`w-3 h-3 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10 bg-black/95">
                <div className="px-4 py-3 border-b border-white/[0.08]">
                  <span className="text-xs font-['Poppins'] text-white/40 uppercase tracking-[0.14em]">Filter by module</span>
                </div>
                <div className="p-2">
                  {[{ id: 'all', name: 'All Modules' }, ...ALL_MODULES].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setFilterModule(m.id); setShowFilterDropdown(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors text-xs font-['Poppins'] uppercase tracking-[0.08em] rounded-lg ${
                        filterModule === m.id
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30'
                          : 'text-white/60 hover:bg-[#00E5FF]/5 hover:text-white/90'
                      }`}
                    >
                      {m.id !== 'all' && getIcon(m.icon, 'w-4 h-4 flex-shrink-0')}
                      <span className="flex-1">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ScanTabs activeScanTab={activeScanTab} setActiveScanTab={setActiveScanTab} />

        {/* Running Scans Section */}
        <section className="min-h-[200px] mt-6">
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

        {/* Tab Panels */}
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

        {/* History + Stats Section */}
        <section className="mt-8">
          <ScanHistory scanHistory={scanHistory} onRemoveScan={handleRemoveScan} />

          <div className="border border-white/10 rounded-b-2xl px-6 py-5 bg-black/40 mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-7">
                <StatBadge label="Total Scans" value={stats.total} accent="#00E5FF" />
                <div className="w-px h-10 bg-white/10" />
                <StatBadge label="Active Now" value={stats.activeNow} accent="#2DD4BF" />
              </div>

              <div className="flex items-center gap-2 text-white/25 text-[11px] font-['Poppins'] uppercase tracking-[0.12em]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Not yet updated'}
              </div>
            </div>
          </div>
        </section>
      </div>

      {renderAddModal()}
      {renderEditModal()}
    </div>
  );
};

export default ScanDashboard;